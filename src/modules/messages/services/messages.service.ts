import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageEntity } from '../entities/message.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private readonly database: DatabaseService) {}

  async create(createMessageDto: CreateMessageDto) {
    const { senderId, conversationId, content } = createMessageDto;
    const newMessage = await this.database.message.create({
      data: {
        sender: { connect: { id: senderId } },
        conversation: { connect: { id: conversationId } },
        content,
      },
    });

    const newMessageEntity = new MessageEntity(newMessage);

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
}
