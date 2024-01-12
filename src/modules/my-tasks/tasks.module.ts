import { Module } from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import { TasksController } from './tasks.controller';
import { ClientsModule } from '@modules/clients/clients.module';
import { TaskSellersService } from './services/task-sellers.service';
import { TaskAccountantsService } from './services/task-accountants.service';

@Module({
  imports: [ClientsModule],
  controllers: [TasksController],
  providers: [TasksService, TaskSellersService, TaskAccountantsService],
  exports: [TasksService, TaskSellersService, TaskAccountantsService],
})
export class TasksModule {}
