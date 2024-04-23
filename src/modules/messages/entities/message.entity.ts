import { ParticipantEntity } from '@modules/participants/entities/participant.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from '@prisma/client';

export class MessageEntity implements Message {
  constructor(data?: Partial<MessageEntity>) {
    Object.assign(this, data);

    if (data?.sender) {
      this.sender = new ParticipantEntity(data.sender);
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
  content: string;

  @ApiProperty()
  conversationId: number;

  @ApiProperty()
  senderId: number;

  @ApiProperty({ type: () => ParticipantEntity })
  sender?: ParticipantEntity;
}
