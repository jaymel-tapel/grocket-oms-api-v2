import { HttpException, Injectable } from '@nestjs/common';
import { ParticipantsService } from '../../participants/services/participants.service';
import { ConversationsService } from '@modules/conversations/services/conversations.service';
import { CreateChatDto } from '../dto/create-chat.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { MessagesService } from '../../messages/services/messages.service';
import { SenderDto } from '@modules/chats/dto/sender.dto';
import { CreateParticipantDto } from '@modules/participants/dto/create-participant.dto';

@Injectable()
export class ChatsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly participantsService: ParticipantsService,
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  async create(createChatDto: CreateChatDto) {
    const { senderDto, createConversationDto } = createChatDto;
    const { receivers } = createConversationDto;

    const newReceiversArr = [...receivers];

    newReceiversArr.push({ user_email: senderDto.email });

    await this.validateParticpants(newReceiversArr);

    // ? Create Conversation first
    const newConversation = await this.conversationsService.create(
      createConversationDto,
    );

    const newParticipants = await this.participantsService.createParticipants(
      newConversation.id,
      newReceiversArr,
    );

    return { newConversation, newParticipants };
  }

  async findCommonConversation(
    receivers: CreateParticipantDto[],
    senderDto: SenderDto,
  ) {
    const participants = await this.participantsService.findParticipantsByEmail(
      receivers,
      senderDto,
    );

    return await this.conversationsService.findCommonConversation(participants);
  }

  private async validateParticpants(participants: CreateParticipantDto[]) {
    const database = await this.database.softDelete();

    const promises = participants.map((participant) => {
      if ('user_email' in participant) {
        return database.user.findFirst({
          where: { email: participant.user_email },
        });
      } else {
        return database.client.findFirst({
          where: { email: participant.client_email },
        });
      }
    });

    const allParticipantsAreValid = (await Promise.all(promises)).every(
      Boolean,
    );

    if (!allParticipantsAreValid) {
      throw new HttpException('Some of Receivers are not valid', 400);
    }
  }
}
