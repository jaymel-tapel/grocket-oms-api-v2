import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsAllExceptionsFilter } from '@src/common/filters/ws-all-exception.filter';
import { IServerToClientEvents } from './interfaces/chats.interface';
import { MessageEntity } from '@modules/messages/entities/message.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ClientEntity } from '@modules/clients/entities/client.entity';
import { IActiveUser } from './interfaces/ActiveUser.interface';

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
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server<any, IServerToClientEvents>;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly jwtService: JwtService,
  ) {}

  // TODO:
  private async setActiveStatus(socket: Socket, isActive: boolean) {
    const user = socket.data?.user;

    if (!user) return;

    const activeUser: IActiveUser = {
      email: user.email,
      socketId: socket.id,
      isActive,
    };

    await this.cache.set(`user ${user.email}`, activeUser, 0);
    // this.server.emit('getOnlineUsers', );
  }

  async handleConnection(socket: Socket) {
    console.log('User Connected: ', socket.id);

    const bearerToken =
      socket.handshake.headers.authorization.split(' ')[1] ?? null;

    if (!bearerToken) {
      this.handleDisconnect(socket);
      return;
    }

    const authUser = this.decodeJwtToken(socket, bearerToken);

    if (!authUser) {
      await this.handleDisconnect(socket);
      return;
    }

    socket.data.user = authUser;

    await this.setActiveStatus(socket, true);
  }

  async handleDisconnect(socket: Socket) {
    socket.on('disconnect', () => {
      console.log('User Disconnected: ', socket.id);
    });
    await this.setActiveStatus(socket, false);
    socket.disconnect();
  }

  sendMessage(_receiverEmail: string, message: MessageEntity) {
    const receiverSocketId = getReceiverSocketId(_receiverEmail);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('onMessage', message);
    }
  }

  @SubscribeMessage('updateActiveStatus')
  async updateActiveStatus(socket: Socket, isActive: boolean) {
    if (!socket.data?.user) return;

    await this.setActiveStatus(socket, isActive);
  }

  private decodeJwtToken(
    socket: Socket,
    bearerToken: string,
  ): UserEntity | ClientEntity {
    try {
      return this.jwtService.verify(bearerToken, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      socket.emit('error', {
        name: error.name,
        message: error.message,
        stack: error.stack?.replace(/\n/g, ''),
      });
      return;
    }
  }
}
