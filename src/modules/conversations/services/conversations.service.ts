import _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { Prisma } from '@prisma/client';
import { ConversationEntity } from '../entities/conversation.entity';
import { UpdateConversationDto } from '../dto/update-conversation.dto';
import { ParticipantsService } from '../../participants/services/participants.service';
import { ClientEntity } from '@modules/clients/entities/client.entity';
import { UserEntity } from '@modules/users/entities/user.entity';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly participantsService: ParticipantsService,
  ) {}

  async create({ name, receivers }: CreateConversationDto) {
    return await this.database.conversation.create({
      data: {
        name,
      },
    });
  }

  async update(id: number, updateConversationDto: UpdateConversationDto) {
    return await this.database.conversation.update({
      where: { id },
      data: updateConversationDto,
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

  async findConversationsByEmail(email: string) {
    const database = await this.database.softDelete();

    const user = await database.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      include: { participants: { include: { conversation: true } } },
    });

    const conversationIds = user.participants.flatMap(
      (participant) => participant.conversationId,
    );

    const conversations = await database.conversation.findMany({
      where: { id: { in: conversationIds } },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            client: { select: { id: true, name: true, email: true } },
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

  async findCommonConversation(participantsArr: (ClientEntity | UserEntity)[]) {
    const participant1 = participantsArr[0];
    const participant2 = participantsArr[1];

    const commonConversationId = _.intersectionBy(
      _.flatMap(participant1?.participants, 'conversation'),
      _.flatMap(participant2?.participants, 'conversation'),
      'conversationId',
    );

    return commonConversationId;
  }

  // private async findConversationsByEmail(
  //   email: string,
  //   modelName?: 'user' | 'client',
  // ) {
  //   const database = await this.database.softDelete();

  //   const userOrClient: UserEntity | ClientEntity = await (
  //     database[modelName] as any
  //   ).findFirst({
  //     where: { email: { equals: email, mode: 'insensitive' } },
  //     include: { participants: { include: { conversations: true } } },
  //   });

  //   const conversationIds = userOrClient.participants.flatMap(
  //     (participant) => participant.conversationId,
  //   );

  //   const conversations: ConversationEntity[] =
  //     await database.conversation.findMany({
  //       where: { id: { in: conversationIds } },
  //       include: {
  //         participants: {
  //           include: {
  //             user: { select: { id: true, name: true, email: true } },
  //             client: { select: { id: true, name: true, email: true } },
  //           },
  //         },
  //         messages: {
  //           take: 1,
  //           orderBy: { createdAt: 'desc' },
  //         },
  //       },
  //     });

  //   return conversations;
  // }
}
