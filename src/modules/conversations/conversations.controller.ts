import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConversationsService } from './services/conversations.service';
import { JwtGuard } from '@modules/auth/guard';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConversationEntity } from './entities/conversation.entity';
import { ChatsGateway } from '@modules/websocket-gateways/chats.gateway';
import { CreateConversationDto } from './dto/create-conversation.dto';

@UseGuards(JwtGuard)
@Controller('conversations')
@ApiTags('conversations')
@ApiBearerAuth()
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly chatsGateway: ChatsGateway,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ConversationEntity })
  async create(@Body() createConvoDto: CreateConversationDto) {
    return this.conversationsService.create(createConvoDto);
  }

  @Get()
  @ApiOkResponse({ type: [ConversationEntity] })
  async getAllConversations(@AuthUser() user: UserEntity) {
    const convos = await this.conversationsService.findConversationsByEmail(
      user.email,
    );

    const convoEntities = convos.map((convo) => new ConversationEntity(convo));

    return convoEntities;
  }
}
