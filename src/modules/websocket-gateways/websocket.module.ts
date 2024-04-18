import { Module } from '@nestjs/common';
import { ChatsGateway } from './chats.gateway';
import { HashService } from '@modules/auth/services/hash.service';
import { JwtService } from '@nestjs/jwt';
import { ParticipantsModule } from '@modules/participants/participants.module';
import { ConversationsModule } from '@modules/conversations/conversations.module';
import { MessagesModule } from '@modules/messages/messages.module';
import { ChatsService } from '../chats/services/chats.service';
import { ChatsModule } from '@modules/chats/chats.module';

@Module({
  imports: [
    ChatsModule,
    ParticipantsModule,
    ConversationsModule,
    MessagesModule,
  ],
  providers: [ChatsGateway, HashService, JwtService],
  exports: [ChatsGateway],
})
export class WebsocketModule {}
