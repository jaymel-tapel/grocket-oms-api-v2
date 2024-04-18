import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { Prisma } from '@prisma/client';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ClientEntity } from '@modules/clients/entities/client.entity';
import { ConversationEntity } from '../entities/conversation.entity';

@Injectable()
export class ConversationsService {
  constructor(private readonly database: DatabaseService) {}

  async create({ name }: CreateConversationDto) {
    return await this.database.conversation.create({
      data: { name },
    });
  }

  async findOne(args: Prisma.ConversationFindFirstArgs) {
    const database = await this.database.softDelete();
    return await database.conversation.findFirst({
      ...args,
    });
  }

  async findAll(args: Prisma.ConversationFindManyArgs) {
    const database = await this.database.softDelete();
    return await database.conversation.findMany({
      ...args,
      orderBy: {
        createdAt: 'desc',
        ...args.orderBy,
      },
    });
  }

  async findConversationsByEmail(email: string, modelName?: 'user' | 'client') {
    const database = await this.database.softDelete();

    const userOrClient: UserEntity | ClientEntity = await (
      database[modelName] as any
    ).findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      include: { participants: { include: { conversations: true } } },
    });

    const conversationIds = userOrClient.participants.flatMap((participant) =>
      participant.conversations.map((convo) => convo.conversationId),
    );

    const conversations: ConversationEntity[] =
      await database.conversation.findMany({
        where: { id: { in: conversationIds } },
        include: {
          participants: {
            include: {
              participant: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                  client: { select: { id: true, name: true, email: true } },
                },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

    return conversations;
  }
}
