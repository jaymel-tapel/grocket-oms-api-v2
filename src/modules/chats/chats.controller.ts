import { JwtGuard } from '@modules/auth/guard';
import {
  Body,
  ConflictException,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ChatsService } from './services/chats.service';
import { CombinedCreateChatDto } from '@modules/chats/dto/create-chat.dto';
import { SenderDto } from '@modules/chats/dto/sender.dto';
import { CreateConversationDto } from '@modules/conversations/dto/create-conversation.dto';
import { CreateChatMessageDto } from '@modules/messages/dto/create-message.dto';
import { isEmpty } from 'lodash';

@UseGuards(JwtGuard)
@Controller('chats')
@ApiTags('chats')
@ApiBearerAuth()
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiBody({ type: CombinedCreateChatDto })
  async create(
    @Body() senderDto: SenderDto,
    @Body() createConversationDto: CreateConversationDto,
    @Body() createMessageDto: CreateChatMessageDto,
  ) {
    const { receivers } = createConversationDto;

    if (receivers.length <= 1) {
      const commonConversation = await this.chatsService.findCommonConversation(
        receivers,
        senderDto,
      );

      /*
        ? If there is a common convo between the sender and receiver
        ? Then join them to their conversation
      */
      if (!isEmpty(commonConversation)) {
        throw new ConflictException(
          'Conversation between these two already exists',
        );
      }
    }

    // ? Create a new Conversation and assign Participants
    return await this.chatsService.create({
      senderDto,
      createConversationDto,
      createMessageDto,
    });
  }
}
