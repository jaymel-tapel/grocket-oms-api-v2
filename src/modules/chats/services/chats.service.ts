import { Injectable } from '@nestjs/common';
import { ParticipantsService } from '../../participants/services/participants.service';
import { ConversationsService } from '@modules/conversations/services/conversations.service';
import { CreateChatDto } from '../../websocket-gateways/dto/create-chat.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { MessagesService } from '../../messages/services/messages.service';
import { CreateMessageDto } from '@modules/messages/dto/create-message.dto';
import { SenderDto } from '@modules/websocket-gateways/dto/sender.dto';
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

    // ? Create Conversation first
    const newConversation = await this.conversationsService.create(
      createConversationDto,
    );

    const newParticipants = await this.createParticipants(senderDto, receivers);

    const participantIds = newParticipants.map(
      (newParticipant) => newParticipant.id,
    );

    // ? Assign participants to the conversation
    await this.assignParticipantConversation(
      newConversation.id,
      participantIds,
    );

    return { newConversation, newParticipants };
  }

  private async createParticipants(
    senderDto: SenderDto,
    participants: CreateParticipantDto[],
  ) {
    let emailKey: 'client_email' | 'user_email';
    emailKey = senderDto.appType === 'OMS' ? 'user_email' : 'client_email';

    participants.push({ [emailKey]: senderDto.email });

    // ? Next is to create participants
    const newParticipants = await Promise.all(
      participants.map((participant) =>
        this.participantsService.create(participant),
      ),
    );

    return newParticipants;
  }

  async createMessage(createMessageDto: Partial<CreateMessageDto>) {
    return await this.messagesService.create(
      createMessageDto as CreateMessageDto,
    );
  }

  async assignParticipantConversation(
    conversationId: number,
    participantIds: number[],
  ) {
    return await Promise.all(
      participantIds.map((participantId) =>
        this.database.participantConversation.create({
          data: {
            conversationId,
            participantId,
            participantCount: participantIds.length,
          },
        }),
      ),
    );
  }

  async findCommonConversation(
    receivers: CreateParticipantDto[],
    senderDto: SenderDto,
  ) {
    const participants = await this.participantsService.findParticipantsByEmail(
      receivers,
      senderDto,
    );

    const commonConversation =
      await this.participantsService.findCommonConversationBetweenParticipants(
        participants,
      );

    return commonConversation;
  }
}
