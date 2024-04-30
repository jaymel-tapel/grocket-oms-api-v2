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
import { DatabaseService } from '@modules/database/services/database.service';
import { ConversationEntity } from '@modules/conversations/entities/conversation.entity';
import { UserOrClientType } from './types/UserOrClient.type';

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
    private readonly database: DatabaseService,
  ) {}

  private async getParticipants(authEmail: string, type: UserOrClientType) {
    const convos = await this.database.conversation.findMany({
      where: {
        participants: {
          some: {
            [type]: { email: authEmail },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile_image: true,
              },
            },
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                clientInfo: { select: { profile_url: true } },
              },
            },
          },
        },
      },
    });

    const { id: authId } = await (this.database[type] as any).findFirst({
      where: { email: { contains: authEmail, mode: 'insensitive' } },
      select: { id: true },
    });

    const conversations = convos.map((convo) => new ConversationEntity(convo));

    const participants = conversations
      .flatMap((convoEntity) => convoEntity.participants)
      .map((p) => {
        const isUserAuth = p[`${type}Id`] === authId;

        if (!isUserAuth) {
          if ('client' in p) {
            return {
              email: p.client.email,
            };
          } else {
            return {
              email: p.user.email,
            };
          }
        }
      })
      .filter(Boolean);

    return participants;
  }

  private async setActiveStatus(socket: Socket, isActive: boolean) {
    const user = socket.data?.user;
    const type = socket.handshake.query.type as UserOrClientType;

    if (!user || !type) return;

    const activeUser: IActiveUser = {
      type,
      email: user.email,
      socketId: socket.id,
      isActive,
    };

    await this.cache.set(`user ${user.email}`, activeUser, 0);

    await this.emitStatusToParticipants(activeUser);
  }

  private async emitStatusToParticipants(activeUser: IActiveUser) {
    const participants = await this.getParticipants(
      activeUser.email,
      activeUser.type,
    );

    for (const p of participants) {
      const user = await this.cache.get(`user ${p.email}`);

      if (!user) continue;

      const participant = user as IActiveUser;

      this.server.to(participant.socketId).emit('getOnlineUsers', activeUser);
    }
  }

  async handleConnection(socket: Socket) {
    console.log('User Connected: ', socket.id);

    const bearerToken =
      socket.handshake.headers.authorization?.split(' ')[1] ?? null;

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

  async sendMessage(_receiverEmail: string, message: MessageEntity) {
    const receiver = (await this.cache.get(
      `user ${_receiverEmail}`,
    )) as IActiveUser;
    if (receiver) {
      this.server.to(receiver.socketId).emit('onMessage', message);
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
