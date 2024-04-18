import { Module } from '@nestjs/common';
import { ConversationsService } from './services/conversations.service';
import { ConversationsController } from './conversations.controller';
import { WebsocketModule } from '@modules/websocket-gateways/websocket.module';
import { ParticipantsModule } from '@modules/participants/participants.module';

@Module({
  imports: [WebsocketModule, ParticipantsModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
