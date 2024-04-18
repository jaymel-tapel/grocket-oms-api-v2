import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  OnModuleInit,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WsAllExceptionsFilter } from '@src/common/filters/ws-all-exception.filter';
import { IServerToClientEvents } from './interfaces/chats.interface';
import { MessageEntity } from '@modules/messages/entities/message.entity';
import { CreateConversationDto } from '@modules/conversations/dto/create-conversation.dto';
import { CreateMessageDto } from '@modules/messages/dto/create-message.dto';
import { ChatsService } from '../chats/services/chats.service';
import { SenderDto } from './dto/sender.dto';
import { ParticipantsService } from '@modules/participants/services/participants.service';
import { MessagesService } from '@modules/messages/services/messages.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { UpdateMessageDto } from '@modules/messages/dto/update-message.dto';
import { ConversationsService } from '@modules/conversations/services/conversations.service';
import { ConversationEntity } from '@modules/conversations/entities/conversation.entity';
import { isEmpty } from 'lodash';
import { GetAllConversationsDto } from '@modules/conversations/dto/get-conversation.dto';
import { determineModelName } from '@src/common/helpers/participants';

@WebSocketGateway()
@UseFilters(WsAllExceptionsFilter)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
)
export class ChatsGateway implements OnModuleInit {
  @WebSocketServer() server: Server<any, IServerToClientEvents>;

  constructor(
    private readonly chatsService: ChatsService,
    private readonly participantsService: ParticipantsService,
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
  ) {}

  onModuleInit() {
    this.server.on('connect', (socket) => {
      console.log(`Connected: ${socket.id}`);
    });
  }

  @SubscribeMessage('createChat')
  async create(
    @ConnectedSocket() socket: Socket,
    @MessageBody() senderDto: SenderDto,
    @MessageBody() createConversationDto: CreateConversationDto,
    @MessageBody() createMessageDto: UpdateMessageDto,
  ) {
    const newCreateMessageDto = createMessageDto as CreateMessageDto;

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
        return await this.joinAndSendMessage(
          socket,
          newCreateMessageDto,
          senderDto,
          commonConversation.conversationId,
        );
      }
    }

    // ? Create a new Conversation and assign Participants
    const { newConversation } = await this.chatsService.create({
      senderDto,
      createConversationDto,
    });

    return await this.joinAndSendMessage(
      socket,
      newCreateMessageDto,
      senderDto,
      newConversation.id,
    );
  }

  @SubscribeMessage('getConversations')
  async getConversations(
    @ConnectedSocket() socket: Socket<any, IServerToClientEvents>,
    @MessageBody() getConvosDto: GetAllConversationsDto,
  ) {
    const modelName = determineModelName(getConvosDto.appType);

    const convos = await this.conversationsService.findConversationsByEmail(
      getConvosDto.email,
      modelName,
    );

    const convoEntities = convos.map((convo) => new ConversationEntity(convo));

    socket.emit('getConversations', convoEntities);
  }

  @SubscribeMessage('getMessages')
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { conversationId }: JoinRoomDto,
  ) {
    socket.join(`${conversationId}`);

    this.server
      .to(String(conversationId))
      .emit('joinRoom', { message: `Joined to room no. ${conversationId}` });

    return await this.getChatHistory(conversationId);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(@MessageBody() createMessageDto: CreateMessageDto) {
    // ? Create a message
    const message = await this.chatsService.createMessage(createMessageDto);

    this.server.to(`${message.conversationId}`).emit('onMessage', message);
  }

  async getChatHistory(conversationId: number) {
    const messages = await this.messagesService.findAll(conversationId);

    this.server.to(String(conversationId)).emit(
      'chatHistory',
      messages.map((m) => new MessageEntity(m)),
    );
  }

  private async joinAndSendMessage(
    socket: Socket,
    createMessageDto: CreateMessageDto,
    senderDto: SenderDto,
    conversationId: number,
  ) {
    if (createMessageDto?.content) {
      const sender = await this.participantsService.findSenderParticipant(
        senderDto,
      );

      createMessageDto.conversationId = conversationId;
      createMessageDto.senderId = sender.id;

      await this.joinRoom(socket, { conversationId });
      return await this.sendMessage(createMessageDto as CreateMessageDto);
    }
  }
}
