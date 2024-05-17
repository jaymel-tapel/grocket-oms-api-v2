import {
  ClientEntity,
  SimplifiedClientEntity,
} from '@modules/clients/entities/client.entity';
import {
  SimplifiedUserEntity,
  UserEntity,
} from '@modules/users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatedByEnum, Task, TaskTypeEnum } from '@prisma/client';
import { TaskAccountantEntity } from './task-accountant.entity';
import { TaskSellerEntity } from './task-seller.entity';
import { OrderEntity } from '@modules/orders/entities/order.entity';

export class TaskEntity implements Task {
  constructor(data?: Partial<TaskEntity>) {
    Object.assign(this, data);

    if (data?.user) {
      this.user = new UserEntity(data?.user);
    }

    if (data?.client) {
      this.client = new ClientEntity(data?.client);
    }

    if (data?.taskAccountant) {
      this.taskAccountant = new TaskAccountantEntity(data?.taskAccountant);
    }

    if (data?.taskSeller) {
      this.taskSeller = new TaskSellerEntity(data?.taskSeller);
    }

    if (data?.order) {
      this.order = new OrderEntity(data?.order);
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

  @ApiPropertyOptional({ type: TaskAccountantEntity })
  taskAccountant?: TaskAccountantEntity;

  @ApiPropertyOptional({ type: TaskSellerEntity })
  taskSeller?: TaskSellerEntity;

  @ApiPropertyOptional({ type: SimplifiedUserEntity })
  user?: UserEntity | null;

  @ApiPropertyOptional({ type: SimplifiedClientEntity })
  client?: ClientEntity | null;

  @ApiPropertyOptional({ type: OrderEntity })
  order?: OrderEntity | null;
}
