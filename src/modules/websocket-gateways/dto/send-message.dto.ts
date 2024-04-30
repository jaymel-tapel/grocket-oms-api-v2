import { MessageEntity } from '@modules/messages/entities/message.entity';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsEmail()
  receiverEmail: string;

  @IsNotEmpty()
  message: MessageEntity;
}
