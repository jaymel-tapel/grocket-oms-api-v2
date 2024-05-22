import { Module } from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import { TasksController } from './tasks.controller';
import { TaskSellersService } from './services/task-sellers.service';
import { TaskAccountantsService } from './services/task-accountants.service';

@Module({
  imports: [],
  controllers: [TasksController],
  providers: [TasksService, TaskSellersService, TaskAccountantsService],
  exports: [TasksService, TaskSellersService, TaskAccountantsService],
})
export class TasksModule {}
