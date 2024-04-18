import { ClientEntity } from '@modules/clients/entities/client.entity';
import { ConversationEntity } from '@modules/conversations/entities/conversation.entity';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Participant } from '@prisma/client';

export class ParticipantEntity implements Participant {
  constructor(data?: Partial<ParticipantEntity>) {
    Object.assign(this, data);

    if (!data.clientId) {
      if (data?.user) this.user = new UserEntity(data?.user);

      delete this.clientId;
      delete this.client;
    } else {
      if (data?.client) this.client = new ClientEntity(data?.client);
      delete this.userId;
      delete this.user;
    }
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @ApiProperty()
  conversationId: number;

  @ApiPropertyOptional({ nullable: true })
  userId: number;

  @ApiPropertyOptional({ nullable: true })
  clientId: number;

  @ApiPropertyOptional({ type: () => UserEntity, nullable: true })
  user?: Partial<UserEntity> | null;

  @ApiPropertyOptional({ type: ClientEntity, nullable: true })
  client?: Partial<ClientEntity> | null;

  @ApiPropertyOptional({
    type: ConversationEntity,
    nullable: true,
  })
  conversation?: ConversationEntity;
}
