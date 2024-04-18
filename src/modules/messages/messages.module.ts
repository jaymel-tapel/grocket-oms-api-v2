import { Module } from '@nestjs/common';
import { MessagesService } from './services/messages.service';
import { WebsocketModule } from '@modules/websocket-gateways/websocket.module';
import { MessagesController } from './messages.controller';

@Module({
  imports: [WebsocketModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
