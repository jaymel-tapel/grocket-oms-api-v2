import { Module } from '@nestjs/common';
import { OrdersCronService } from './services/orders-cron.service';
import { TasksModule } from '@modules/my-tasks/tasks.module';

@Module({
  imports: [TasksModule],
  providers: [OrdersCronService],
  exports: [OrdersCronService],
})
export class CronModule {}
