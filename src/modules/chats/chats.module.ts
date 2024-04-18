import { Module } from '@nestjs/common';
import { ChatsService } from './services/chats.service';
import { ParticipantsModule } from '@modules/participants/participants.module';
import { ConversationsModule } from '@modules/conversations/conversations.module';
import { MessagesModule } from '@modules/messages/messages.module';

@Module({
  imports: [ParticipantsModule, ConversationsModule, MessagesModule],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
