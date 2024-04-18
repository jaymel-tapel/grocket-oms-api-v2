import { CreateConversationDto } from '@modules/conversations/dto/create-conversation.dto';
import { CreateMessageDto } from '@modules/messages/dto/create-message.dto';
import { UpdateMessageDto } from '@modules/messages/dto/update-message.dto';
import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
} from '@nestjs/swagger';
import { IsNotEmptyObject } from 'class-validator';
import { SenderDto } from './sender.dto';

export class CreateChatDto {
  @ApiProperty({ type: SenderDto })
  senderDto: SenderDto;

  @ApiPropertyOptional({ type: UpdateMessageDto })
  createMessageDto?: UpdateMessageDto;

  @ApiPropertyOptional({ type: CreateConversationDto })
  createConversationDto?: CreateConversationDto;
}

export class CombinedCreateChatDto extends IntersectionType(
  OmitType(CreateConversationDto, ['name']),
  UpdateMessageDto,
) {
  @IsNotEmptyObject()
  @ApiProperty({ type: SenderDto })
  senderDto: SenderDto;
}
