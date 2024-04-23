import { JwtGuard } from '@modules/auth/guard';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MessagesService } from './services/messages.service';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { FilterMessageDto } from './dto/filter-message.dto';

@UseGuards(JwtGuard)
@Controller('messages')
@ApiTags('messages')
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiCreatedResponse({ type: MessageEntity })
  async create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  @ApiOkResponse({ type: [MessageEntity] })
  async findAll(@Query() filterMessage: FilterMessageDto) {
    const messages = await this.messagesService.findAll(
      filterMessage.conversationId,
    );
    return messages.map((message) => new MessageEntity(message));
  }
}
