import { MessageEntity } from '@modules/messages/entities/message.entity';
import { Type } from 'class-transformer';
import { IsArray, IsNumber } from 'class-validator';

export class GetChatHistoryDto {
  @IsNumber()
  conversationId: number;

  @IsArray()
  @Type(() => MessageEntity)
  messages: MessageEntity[];
}
