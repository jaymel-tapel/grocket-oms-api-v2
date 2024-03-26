import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, TaskAccountant } from '@prisma/client';
import { TaskEntity } from './task.entity';

export class TaskAccountantEntity implements TaskAccountant {
  constructor(data?: Partial<TaskAccountantEntity>) {
    Object.assign(this, data);

    if (data?.task) {
      this.task = new TaskEntity(data?.task);
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

  @ApiProperty({ type: () => TaskEntity })
  task?: TaskEntity;
}
