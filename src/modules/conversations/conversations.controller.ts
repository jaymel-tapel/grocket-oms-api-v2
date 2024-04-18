import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetAllConversationsDto } from './dto/get-conversation.dto';
import { ConversationsService } from './services/conversations.service';
import { JwtGuard } from '@modules/auth/guard';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ApiOkResponse } from '@nestjs/swagger';
import { ParticipantConversationEntity } from '@modules/participant-conversations/participant-conversation.entity';
import { ConversationEntity } from './entities/conversation.entity';

@UseGuards(JwtGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @ApiOkResponse({ type: [ConversationEntity] })
  async getAllConversations(@AuthUser() user: UserEntity) {
    const convos = await this.conversationsService.findConversationsByEmail(
      user.email,
    );

    return convos.map((convo) => new ConversationEntity(convo));
  }
}
