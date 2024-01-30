import { ClientEntity } from '@modules/clients/entities/client.entity';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatedByEnum, Task } from '@prisma/client';

export class TaskEntity implements Task {
  constructor({ user, client, ...partial }: Partial<TaskEntity>) {
    Object.assign(this, partial);

    if (user) {
      this.user = new UserEntity(user);
    }

    if (client) {
      this.client = new ClientEntity(client);
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

  @ApiProperty()
  taskTypeId: number;

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
