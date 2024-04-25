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
import { GetChatHistoryDto } from './dto/get-chat-history.dto';

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

  onModuleInit() {
    this.server?.on('connect', (socket) => {
      console.log(`Connected: ${socket.id}`);
    });
  }

  @SubscribeMessage('getOnlineUsers')
  setOnline(@ConnectedSocket() socket: Socket) {
    // this.server.emit('getOnlineUsers', user);
  }

  sendMessage(message: MessageEntity) {
    this.server.to(`${message.conversationId}`).emit('onMessage', message);
  }

  @SubscribeMessage('getChats')
  getChatHistory(
    @MessageBody() { conversationId, messages }: GetChatHistoryDto,
  ) {
    this.server.to(String(conversationId)).emit(
      'chatHistory',
      messages.map((m) => new MessageEntity(m)),
    );
  }
}
