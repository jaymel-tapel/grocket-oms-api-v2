import { ConversationEntity } from '@modules/conversations/entities/conversation.entity';
import { ParticipantEntity } from '@modules/participants/entities/participant.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ParticipantConversation } from '@prisma/client';

export class ParticipantConversationEntity implements ParticipantConversation {
  constructor(data: ParticipantConversationEntity) {
    Object.assign(this, data);

    if (data?.conversation) {
      this.conversation = new ConversationEntity(data.conversation);
    }

    if (data?.participant) {
      this.participant = new ParticipantEntity(data.participant);
    }
  }

  @ApiProperty()
  participantId: number;

  @ApiProperty()
  conversationId: number;

  @ApiProperty()
  participantCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => ParticipantEntity })
  participant?: ParticipantEntity;

  @ApiProperty({ type: ConversationEntity })
  conversation?: ConversationEntity;
}
