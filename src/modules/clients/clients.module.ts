import { Module } from '@nestjs/common';
import { ClientsService } from './services/clients.service';
import { ClientsController } from './clients.controller';
import { UsersModule } from '../users/users.module';
import { HashService } from '../auth/services/hash.service';
import { ClientReportsService } from './services/client-reports.service';
import { EventsModule } from '@modules/events/events.module';

@Module({
  imports: [UsersModule, EventsModule],
  controllers: [ClientsController],
  providers: [ClientsService, HashService, ClientReportsService],
  exports: [ClientsService],
})
export class ClientsModule {}
