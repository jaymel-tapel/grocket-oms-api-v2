import { ClientEntity } from '@modules/clients/entities/client.entity';
import { DatabaseService } from '@modules/database/services/database.service';
import { TaskEntity } from '@modules/my-tasks/entities/task.entity';
import {
  newTaskTypeHelper,
  taskTypeNameHelper,
} from '@modules/my-tasks/helpers/task-info.helper';
import { TasksService } from '@modules/my-tasks/services/tasks.service';
import { OrderEntity } from '@modules/orders/entities/order.entity';
import { paymentStatusNameHelper } from '@modules/orders/helpers/payment-status-name.helper';
import { Injectable, Logger } from '@nestjs/common';
import { dd } from '@src/common/helpers/debug';
import { PrismaDynamicClient } from '@src/common/types/prisma.types';
import { subDays, subMonths } from 'date-fns';
import { isEmpty, maxBy } from 'lodash';

@Injectable()
export class OrdersCronService {
  private database: PrismaDynamicClient;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly taskService: TasksService,
  ) {
    this.initDB();
  }

  private async initDB() {
    this.database = await this.dbService.softDelete();
  }

  async checkOrders(logger: Logger) {
    const clients = await this.database.client.findMany({
      include: {
        orders: true,
        seller: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const total_clients = clients.length;
    let count_error = 0;

    logger.debug('Running Cron');

    let i = 0;

    for (const client of clients) {
      try {
        logger.debug(`Client: ${client.name}`);
        logger.debug(`${++i} out of ${total_clients}`);
        const lastOrder = maxBy(client.orders, 'createdAt');
        const twoMonthsAgo = subMonths(new Date(), 2);

        // ? If the client's latest order was not made at least 2 months ago
        if (lastOrder?.createdAt > twoMonthsAgo) {
          continue;
        }

        const task = await this.taskService.findOne({
          where: { orderId: lastOrder?.id },
          orderBy: { createdAt: 'desc' },
        });

        if (isEmpty(task) || task?.taskType !== 'TWO_MTFU') {
          // ? Create a new Task for this Order
          await this.createTask(client, lastOrder);
        }
      } catch (error) {
        logger.error(
          `Error checking #${client.id} ${client.name}: ${error.message}`,
        );
        count_error++;
        continue;
      }
    }

    logger.verbose(`Total Clients Found: ${total_clients}`);
    logger.verbose(`Success: ${total_clients - count_error}`);
    logger.error(`Errors: ${count_error}\n`);
  }

  private async createTask(client: ClientEntity, lastOrder: OrderEntity) {
    return await this.database.task.create({
      data: {
        userId: client.sellerId,
        orderId: lastOrder?.id,
        taskType: 'TWO_MTFU',
        taskAccountant: {
          create: {
            title: taskTypeNameHelper('TWO_MTFU'),
            description: `There's no new Order for ${client.name}`,
          },
        },
        taskSeller: {
          create: {
            title: taskTypeNameHelper('TWO_MTFU'),
            description: `There's no new Order for ${client.name}`,
          },
        },
      },
    });
  }

  async checkPayments(logger: Logger) {
    const orders = await this.database.order.findMany({
      where: {
        payment_status: { in: ['SENT_INVOICE', 'PR1', 'PR2'] },
      },
      include: { client: true },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total_orders = orders.length;
    let count_success = 0;
    let count_error = 0;
    let count_skipped = 0;

    logger.debug('Running Cron');

    let eightDaysAgo: boolean;

    for (const order of orders) {
      try {
        const task = await this.taskService.findOne({
          where: { orderId: order.id, createdBy: 'AUTO' },
          include: { taskAccountant: true, taskSeller: true },
          orderBy: { createdAt: 'desc' },
        });

        const taskAccountant = task?.taskAccountant;
        const taskSeller = task?.taskSeller;
        const eitherTaskComplete =
          taskAccountant?.status === 'COMPLETED' ||
          taskSeller?.status === 'COMPLETED';

        if (eitherTaskComplete && order.payment_status_date) {
          logger.debug(`Updating Order ID: ${order.id}`);
          count_success++;

          const payment_status_date = order.payment_status_date;

          eightDaysAgo = await this.eightDaysAgo(payment_status_date);
        } else {
          logger.verbose(`Skipped Order ID: ${order.id}`);
          count_skipped++;
          continue;
        }

        const taskType = task.taskType;

        if (
          eightDaysAgo &&
          taskType !== 'UNPAID' &&
          order.payment_status === taskType
        ) {
          // ? It will automatically update the order's task into new Task. (ex: from SENT_INVOICE to PR1)
          logger.debug(`Eight Days Ago for: ${order.id}`);

          await this.updateToNewTaskType(order, task);
        } else if (eightDaysAgo && eitherTaskComplete) {
          // ? If the task status of the order is complete, but the payment status of the order has not been updated to the new type.
          logger.debug(
            `Setting Order ${order.id} task ${task.id} to incomplete`,
          );

          await this.setTaskToIncomplete(order, task);
        }
      } catch (error) {
        logger.error(`Error checking #${order.id}: ${error.message}`);
        count_error++;
        continue;
      }
    }

    console.log(``);
    logger.verbose(`Total Orders Found: ${total_orders}`);
    logger.verbose(`Success: ${total_orders - count_error}`);
    logger.error(`Errors: ${count_error}\n`);
  }

  private async updateToNewTaskType(order: OrderEntity, task: TaskEntity) {
    const newTaskType = newTaskTypeHelper(task.taskType);
    const clientName = order.client.name;

    const title = taskTypeNameHelper(newTaskType);
    const description =
      newTaskType === 'UNPAID'
        ? `${clientName} is unpaid`
        : `Payment status ${title} for ${clientName}`;

    return await this.database.task.update({
      where: { id: task.id },
      data: {
        taskType: newTaskType,
        taskAccountant: {
          update: {
            status: 'ACTIVE',
            completedAt: null,
            title,
            description,
          },
        },
        taskSeller: {
          update: {
            status: 'ACTIVE',
            completedAt: null,
            title,
            description,
          },
        },
      },
    });
  }

  private async setTaskToIncomplete(order: OrderEntity, task: TaskEntity) {
    const currentStatus = paymentStatusNameHelper(order.payment_status);
    const description = `Update the payment status (Current Status: ${currentStatus})`;
    const status = 'ACTIVE';
    const completedAt = null;

    return await this.database.task.update({
      where: { id: task.id },
      data: {
        taskAccountant: {
          update: {
            description,
            status,
            completedAt,
          },
        },
        taskSeller: {
          update: {
            description,
            status,
            completedAt,
          },
        },
      },
    });
  }

  private async eightDaysAgo(payment_status_date: Date) {
    const eightDays = subDays(new Date(), 8);

    if (payment_status_date > eightDays) {
      return false;
    }

    return true;
  }
}
