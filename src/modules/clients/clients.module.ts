import { Module } from '@nestjs/common';
import { ClientsService } from './services/clients.service';
import { ClientsController } from './clients.controller';
import { UsersModule } from '../users/users.module';
import { HashService } from '../auth/services/hash.service';

@Module({
  imports: [UsersModule],
  controllers: [ClientsController],
  providers: [ClientsService, HashService],
  exports: [ClientsService],
})
export class ClientsModule {}
