import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersCronService } from '@src/common/cron/services/orders-cron.service';
import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'check:order',
})
export class CheckOrderCommand extends CommandRunner {
  private readonly logger = new Logger(CheckOrderCommand.name);
  constructor(private readonly orderCronService: OrdersCronService) {
    super();
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    await this.orderCronService.checkOrders(this.logger);
  }
}
