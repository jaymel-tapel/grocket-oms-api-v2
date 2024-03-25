import { ClientEntity } from '@modules/clients/entities/client.entity';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatedByEnum, Task, TaskTypeEnum } from '@prisma/client';

export class TaskEntity implements Task {
  constructor(data?: Partial<TaskEntity>) {
    Object.assign(this, data);

    if (data?.user) {
      this.user = new UserEntity(data?.user);
    }

    if (data?.client) {
      this.client = new ClientEntity(data?.client);
    }
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  clientId: number;

  @ApiProperty()
  orderId: number;

  @ApiPropertyOptional({ enum: TaskTypeEnum, nullable: true, default: null })
  taskType: TaskTypeEnum | null;

  @ApiProperty({ enum: CreatedByEnum })
  createdBy: CreatedByEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ nullable: true, default: null })
  deletedAt: Date | null;

  @ApiPropertyOptional({ type: UserEntity })
  user?: UserEntity | null;

  @ApiPropertyOptional({ type: ClientEntity })
  client?: ClientEntity | null;
}
