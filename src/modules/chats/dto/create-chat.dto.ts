import { CreateConversationDto } from '@modules/conversations/dto/create-conversation.dto';
import { UpdateMessageDto } from '@modules/messages/dto/update-message.dto';
import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
  PickType,
} from '@nestjs/swagger';
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
  SenderDto,
  PickType(UpdateMessageDto, ['content']),
) {}
