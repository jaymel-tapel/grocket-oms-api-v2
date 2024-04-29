import { Module } from '@nestjs/common';
import { ChatsGateway } from './chats.gateway';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [CacheModule.register()],
  providers: [ChatsGateway, JwtService],
  exports: [ChatsGateway],
})
export class WebsocketModule {}
