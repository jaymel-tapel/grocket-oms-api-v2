import { Module } from '@nestjs/common';
import { ClientsService } from './services/clients.service';
import { ClientsController } from './clients.controller';
import { UsersModule } from '../users/users.module';
import { HashService } from '../auth/services/hash.service';
import { clientCommands } from './commands';

@Module({
  imports: [UsersModule],
  controllers: [ClientsController],
  providers: [ClientsService, HashService, ...clientCommands],
  exports: [ClientsService, ...clientCommands],
})
export class ClientsModule {}
