import { Module } from '@nestjs/common';
import { ChatsService } from './services/chats.service';
import { ParticipantsModule } from '@modules/participants/participants.module';
import { ConversationsModule } from '@modules/conversations/conversations.module';
import { MessagesModule } from '@modules/messages/messages.module';
import { ChatsController } from './chats.controller';
import { WebsocketModule } from '../websocket-gateways/websocket.module';

@Module({
  imports: [
    WebsocketModule,
    ParticipantsModule,
    ConversationsModule,
    MessagesModule,
  ],
  providers: [ChatsService],
  exports: [ChatsService],
  controllers: [ChatsController],
})
export class ChatsModule {}
