import { Injectable } from '@nestjs/common';
import { CreateParticipantDto } from '../dto/create-participant.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ClientEntity } from '@modules/clients/entities/client.entity';
import { Client, Participant, User } from '@prisma/client';
import { UpdateParticipantDto } from '../dto/update-participant.dto';

@Injectable()
export class ParticipantsService {
  constructor(private readonly database: DatabaseService) {}

  async createParticipants(
    conversationId: number,
    participants: CreateParticipantDto[],
  ) {
    // ? Next is to create participants
    const newParticipants = await Promise.all(
      participants.map((participant) =>
        this.create(conversationId, participant),
      ),
    );

    await this.database.conversation.update({
      where: { id: conversationId },
      data: { participantCount: newParticipants.length },
    });

    return newParticipants;
  }

  private async create(
    conversationId: number,
    createParticipantDto: CreateParticipantDto,
  ): Promise<Participant> {
    const { client_email, user_email } = createParticipantDto;

    let client: Client;
    let user: User;

    if (client_email) {
      client = await this.database.client.findFirst({
        where: { email: { equals: client_email, mode: 'insensitive' } },
      });
    } else {
      user = await this.database.user.findFirst({
        where: { email: { equals: user_email, mode: 'insensitive' } },
      });
    }

    let newParticipant: Participant;

    if (client_email) {
      newParticipant = await this.database.participant.create({
        data: { clientId: client.id, conversationId },
      });
    } else {
      newParticipant = await this.database.participant.create({
        data: { userId: user.id, conversationId },
      });
    }

    return newParticipant;
  }

  async findParticipantsByEmail(
    receivers: UpdateParticipantDto[],
    email: string,
  ) {
    const newReceiversArr = [...receivers];

    newReceiversArr.push({ user_email: email });

    const participantsArr: (ClientEntity | UserEntity)[] = [];

    for (const participant of newReceiversArr) {
      if ('client_email' in participant) {
        const client = await this.database.client.findFirst({
          where: {
            email: { equals: participant.client_email, mode: 'insensitive' },
          },
          include: {
            participants: {
              include: {
                conversation: true,
              },
            },
          },
        });

        participantsArr.push(new ClientEntity(client));
      } else {
        const user = await this.database.user.findFirst({
          where: {
            email: { equals: participant?.user_email, mode: 'insensitive' },
          },
          include: {
            participants: {
              include: {
                conversation: true,
              },
            },
          },
        });

        participantsArr.push(new UserEntity(user));
      }
    }

    return participantsArr;
  }

  async findOneByEmail(email: string, conversationId: number) {
    const database = await this.database.softDelete();

    const user = await database.user.findFirst({
      where: { email },
      include: {
        participants: {
          where: { conversationId },
        },
      },
    });

    return user.participants[0];
  }
}
