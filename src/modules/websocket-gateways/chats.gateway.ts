import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
  OnModuleInit,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WsAllExceptionsFilter } from '@src/common/filters/ws-all-exception.filter';
import { IServerToClientEvents } from './interfaces/chats.interface';
import { UserEntity } from '@modules/users/entities/user.entity';
import { MessageEntity } from '@modules/messages/entities/message.entity';

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
    this.server.on('connect', (socket) => {
      console.log(`Connected: ${socket.id}`);
    });
  }

  setOnline(user: UserEntity) {
    this.server.emit('getOnlineUsers', user);
  }

  sendMessage(message: MessageEntity) {
    this.server.to(`${message.conversationId}`).emit('onMessage', message);
  }

  getChatHistory(conversationId: number, messages: MessageEntity[]) {
    this.server.to(String(conversationId)).emit(
      'chatHistory',
      messages.map((m) => new MessageEntity(m)),
    );
  }
}
