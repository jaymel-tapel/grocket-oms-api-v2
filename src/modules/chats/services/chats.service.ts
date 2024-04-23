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
    const { senderDto, createConversationDto, createMessageDto } =
      createChatDto;
    const { receivers } = createConversationDto;
    const { content } = createMessageDto;

    const newReceiversArr = [...receivers];

    let result: object;

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

    result = { newConversation, newParticipants };

    if (createMessageDto.content) {
      const sender = await this.participantsService.findOneByEmail(
        senderDto.email,
        newConversation.id,
      );

      // ? Create a new message for the conversation
      const newMessage = await this.messagesService.create({
        conversationId: newConversation.id,
        senderId: sender.id,
        content,
      });

      result = { ...result, newMessage };
    }

    return result;
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
          where: { email: { equals: participant.user_email, mode: 'insensitive'} },
        });
      } else {
        return database.client.findFirst({
          where: { email: { equals: participant.client_email, mode: 'insensitive'} },
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
