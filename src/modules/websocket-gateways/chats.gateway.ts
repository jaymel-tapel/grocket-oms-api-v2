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
import { MessageEntity } from '@modules/messages/entities/message.entity';

const onlineUsersMap: { [key: string]: string } = {};

const getReceiverSocketId = (receiverEmail: string) => {
  return onlineUsersMap[receiverEmail];
};

@WebSocketGateway({ transport: 'websocket' })
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
      console.log('User Connected: ', socket.id);

      const email = socket.handshake.headers.email as string;

      if (email !== 'undefined') {
        onlineUsersMap[email] = socket.id;
      }

      this.server.emit('getOnlineUsers', Object.keys(onlineUsersMap));

      socket.on('disconnect', () => {
        console.log('User Disconnected: ', socket.id);
      });
    });
  }

  sendMessage(_receiverEmail: string, message: MessageEntity) {
    const receiverSocketId = getReceiverSocketId(_receiverEmail);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('onMessage', message);
    }
  }
}
