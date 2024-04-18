import { MessageEntity } from '@modules/messages/entities/message.entity';
import { ParticipantConversationEntity } from '@modules/participant-conversations/participant-conversation.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Conversation } from '@prisma/client';

export class ConversationEntity implements Conversation {
  constructor(data?: Partial<ConversationEntity>) {
    Object.assign(this, data);

    if (data?.participants) {
      this.participants = data.participants.map(
        (p) => new ParticipantConversationEntity(p),
      );
    }

    if (data?.participants.length === 2) {
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

  // @ApiProperty({ nullable: true })
  // receiver?:

  @ApiProperty({ type: [ParticipantConversationEntity] })
  participants?: ParticipantConversationEntity[];

  @ApiProperty({ type: [MessageEntity] })
  messages?: MessageEntity[];
}
