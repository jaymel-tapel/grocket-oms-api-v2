import { DatabaseService } from '@modules/database/services/database.service';
import { TasksService } from '@modules/my-tasks/services/tasks.service';
import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'restore:orders',
})
export class RestoreDeletedOrdersCommand extends CommandRunner {
  constructor(
    private readonly database: DatabaseService,
    private readonly tasksService: TasksService,
    private readonly logger: Logger,
  ) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const deletedOrders = await this.database.order.findMany({
      where: { deletedAt: { not: null } },
    });

    for (const order of deletedOrders) {
      try {
        this.logger.debug(`Updating Order ID: ${order?.id}`);
        console.log(``);

        await this.database.order.update({
          where: {
            id: order.id,
            deletedAt: { not: null },
          },
          data: {
            deletedAt: null,
            company: {
              update: {
                data: { deletedAt: null },
              },
            },
            orderReviews: {
              updateMany: {
                where: { orderId: order.id },
                data: { deletedAt: null },
              },
            },
          },
        });

        const tasks = await this.database.task.findMany({
          where: { orderId: order.id, deletedAt: { not: null } },
          select: { id: true },
        });

        const taskIds = tasks.map(({ id }) => id);

        await this.tasksService.restoreMany(taskIds);
      } catch (error) {
        this.logger.error(`Error Updating Order ID: ${order?.id}: ${error}`);
        console.log(``);
      }
    }

    this.logger.verbose(`Success!`);
  }
}
