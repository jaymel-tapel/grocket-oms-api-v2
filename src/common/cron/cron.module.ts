import { Module } from '@nestjs/common';
import { OrdersCronService } from './services/orders-cron.service';

@Module({
  providers: [OrdersCronService],
  exports: [OrdersCronService],
})
export class CronModule {}
