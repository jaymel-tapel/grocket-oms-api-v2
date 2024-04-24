import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageEntity } from '../entities/message.entity';
import { Prisma } from '@prisma/client';
import { ChatsGateway } from '@modules/websocket-gateways/chats.gateway';
import { FilterMessageDto } from '../dto/filter-message.dto';
import { ConnectionArgsDto } from '../../page/connection-args.dto';
import { PageEntity } from '@modules/page/page.entity';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { findManyMessages } from '../helper/find-many-messages.helper';

@Injectable()
export class MessagesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly chatsGateway: ChatsGateway,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    const { senderId, conversationId, content } = createMessageDto;

    await this.database.participant.findFirstOrThrow({
      where: { id: senderId, conversationId },
      select: { id: true },
    });

    const newMessage = await this.database.message.create({
      data: {
        sender: { connect: { id: senderId } },
        conversation: { connect: { id: conversationId } },
        content,
      },
    });

    const newMessageEntity = new MessageEntity(newMessage);

    this.chatsGateway.sendMessage(newMessageEntity);

    return newMessageEntity;
  }

  async findAll(conversationId: number, args?: Prisma.MessageFindManyArgs) {
    const database = await this.database.softDelete();
    return await database.message.findMany({
      ...args,
      where: { conversationId, ...args?.where },
      include: {
        ...args?.include,
        sender: {
          include: {
            user: true,
            client: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
        ...args?.orderBy,
      },
    });
  }

  async findAllWithPagination(
    findManyArgs: FilterMessageDto,
    connectionArgsDto: ConnectionArgsDto,
  ) {
    const database = await this.database.softDelete();

    const findManyQuery: Prisma.MessageFindManyArgs = await findManyMessages(
      findManyArgs,
    );

    const page = await findManyCursorConnection(
      // 👇 args contain take, skip and cursor
      async (args) => {
        const { cursor, ...data } = args;

        const findAllArgs = {
          ...data,
          ...(cursor ? { cursor: { id: parseInt(cursor.id, 10) } } : {}), // Convert id to number if cursor is defined
          ...findManyQuery,
        };

        return await database.message.findMany(findAllArgs);
      },
      () => database.message.count({ where: { ...findManyQuery.where } }),
      connectionArgsDto,
      {
        recordToEdge: (record) => ({
          node: new MessageEntity(record),
        }),
      },
    );

    return new PageEntity<MessageEntity>(page);
  }
}
