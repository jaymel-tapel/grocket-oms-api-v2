import { Module } from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import { TasksController } from './tasks.controller';
import { ClientsModule } from '@modules/clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
