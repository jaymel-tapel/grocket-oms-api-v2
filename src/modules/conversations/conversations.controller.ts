import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ConversationsService } from './services/conversations.service';
import { JwtGuard } from '@modules/auth/guard';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ConversationEntity } from './entities/conversation.entity';
import { ChatsGateway } from '@modules/websocket-gateways/chats.gateway';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { FilterConversationDto } from './dto/filter-conversation.dto';
import { ConnectionArgsDto } from '@modules/page/connection-args.dto';
import { ApiPageResponse } from '@modules/page/api-page-response.decorator';

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
  @ApiPageResponse(ConversationEntity)
  async getAllConversations(
    @AuthUser() user: UserEntity,
    @Query() findManyArgs: FilterConversationDto,
    @Query() connectionArgsDto: ConnectionArgsDto,
  ) {
    return await this.conversationsService.findAllWithPagination(
      user,
      findManyArgs,
      connectionArgsDto,
    );
  }
}
