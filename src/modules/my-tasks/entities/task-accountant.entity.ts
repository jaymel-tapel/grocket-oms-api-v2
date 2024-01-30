import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, TaskAccountant } from '@prisma/client';
import { TaskEntity } from './task.entity';

export class TaskAccountantEntity implements TaskAccountant {
  constructor({ task, ...partial }: Partial<TaskAccountantEntity>) {
    Object.assign(this, partial);

    if (task) {
      this.task = new TaskEntity(task);
    }
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  taskId: number;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true, default: null })
  description: string;

  @ApiPropertyOptional({ nullable: true, default: null })
  remarks: string;

  @ApiProperty({ enum: $Enums.TaskStatusEnum })
  status: $Enums.TaskStatusEnum;

  @ApiPropertyOptional({ nullable: true, default: null })
  task_date: Date;

  @ApiPropertyOptional({ nullable: true, default: null })
  completedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ nullable: true, default: null })
  deletedAt: Date | null;

  @ApiProperty()
  task?: TaskEntity;
}
