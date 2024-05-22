import {
  MessageEntity,
  MessageEntityWithoutRelation,
} from '@modules/messages/entities/message.entity';
import {
  PaginatedParticipantEntity,
  ParticipantEntity,
} from '@modules/participants/entities/participant.entity';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Conversation } from '@prisma/client';

export class ConversationEntity implements Conversation {
  constructor(data?: Partial<ConversationEntity>) {
    Object.assign(this, data);

    if (data?.participants) {
      this.participants = data.participants.map(
        (p) => new ParticipantEntity(p),
      );
    }

    if (data?.messages?.length >= 1) {
      this.messages = data.messages.map(
        (message) => new MessageEntity(message),
      );
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

  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty()
  participantCount: number;

  @ApiProperty({ type: () => [PaginatedParticipantEntity] })
  participants?: ParticipantEntity[];

  @ApiProperty({ type: [MessageEntityWithoutRelation] })
  messages?: MessageEntity[];
}

export class ConversationEntityWithoutParticipant extends OmitType(ConversationEntity, ['participants'] as const) {}