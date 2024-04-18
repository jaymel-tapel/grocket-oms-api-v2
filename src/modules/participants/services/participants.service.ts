import { Injectable } from '@nestjs/common';
import { CreateParticipantDto } from '../dto/create-participant.dto';
import { UpdateParticipantDto } from '../dto/update-participant.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ClientEntity } from '@modules/clients/entities/client.entity';
import { Participant, PrismaClient } from '@prisma/client';
import { SenderDto } from '@modules/websocket-gateways/dto/sender.dto';
import _ from 'lodash';
import { ParticipantConversationEntity } from '../../participant-conversations/participant-conversation.entity';
import { determineEmailKey } from '@src/common/helpers/participants';

@Injectable()
export class ParticipantsService {
  constructor(private readonly database: DatabaseService) {}

  async create(createParticipantDto: CreateParticipantDto) {
    const { client_email, user_email } = createParticipantDto;

    let client: ClientEntity;
    let user: UserEntity;

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
        data: { clientId: client.id },
      });
    } else {
      newParticipant = await this.database.participant.create({
        data: { userId: user.id },
      });
    }

    return newParticipant;
  }

  async findSenderParticipant(senderDto: SenderDto) {
    const { appType, email } = senderDto;

    let senderIdKey: 'clientId' | 'userId';
    senderIdKey = appType === 'OMS' ? 'userId' : 'clientId';

    const modelName = appType === 'OMS' ? 'user' : 'client';
    const modelType: PrismaClient[typeof modelName] = this.database[modelName];

    const userOrClient = await (modelType as any).findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    return await this.database.participant.findFirst({
      where: {
        [senderIdKey]: userOrClient.id,
      },
    });
  }

  async findParticipantsByEmail(
    receivers: UpdateParticipantDto[],
    senderDto: SenderDto,
  ) {
    const { appType, email } = senderDto;

    let emailKey = determineEmailKey(appType);

    receivers.push({ [emailKey]: email });

    const participantsArr: (ClientEntity | UserEntity)[] = [];

    for (const participant of receivers) {
      if ('client_email' in participant) {
        const client = await this.database.client.findFirst({
          where: {
            email: { equals: participant.client_email, mode: 'insensitive' },
          },
          include: {
            participants: {
              include: {
                conversations: {
                  where: { participantCount: 2 },
                },
              },
            },
          },
        });

        participantsArr.push(new ClientEntity(client));
      } else {
        const user = await this.database.user.findFirst({
          where: {
            email: { equals: participant.user_email, mode: 'insensitive' },
          },
          include: {
            participants: {
              include: {
                conversations: {
                  where: { participantCount: 2 },
                },
              },
            },
          },
        });

        participantsArr.push(new UserEntity(user));
      }
    }

    return participantsArr;
  }

  async findCommonConversationBetweenParticipants(
    participantsArr: (ClientEntity | UserEntity)[],
  ) {
    const participant1 = participantsArr[0];
    const participant2 = participantsArr[1];

    const commonConversation: ParticipantConversationEntity = _.intersectionBy(
      _.flatMap(participant1.participants, 'conversations'),
      _.flatMap(participant2.participants, 'conversations'),
      'conversationId',
    )[0];

    return commonConversation;
  }
}
