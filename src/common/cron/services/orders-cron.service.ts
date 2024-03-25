import { ClientEntity } from '@modules/clients/entities/client.entity';
import { DatabaseService } from '@modules/database/services/database.service';
import { taskTypeNameHelper } from '@modules/my-tasks/helpers/task-info.helper';
import { TasksService } from '@modules/my-tasks/services/tasks.service';
import { OrderEntity } from '@modules/orders/entities/order.entity';
import { Injectable, Logger } from '@nestjs/common';
import { dd } from '@src/common/helpers/debug';
import { PrismaDynamicClient } from '@src/common/types/prisma.types';
import { subMonths } from 'date-fns';
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
        logger.debug(`${i++} out of ${total_clients}`);
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
}
