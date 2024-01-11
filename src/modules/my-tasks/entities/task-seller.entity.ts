import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, TaskSeller } from '@prisma/client';

export class TaskSellerEntity implements TaskSeller {
  constructor(partial: Partial<TaskSellerEntity>) {
    Object.assign(this, partial);
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
}
