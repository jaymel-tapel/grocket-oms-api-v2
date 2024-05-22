import { Module } from '@nestjs/common';
import { ClientsService } from './services/clients.service';
import { ClientsController } from './clients.controller';
import { UsersModule } from '../users/users.module';
import { HashService } from '../auth/services/hash.service';
import { ClientReportsService } from './services/client-reports.service';
import { ClientEventsService } from '@modules/events/services/client-events.service';

@Module({
  imports: [UsersModule],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    HashService,
    ClientReportsService,
    ClientEventsService,
  ],
  exports: [ClientsService],
})
export class ClientsModule {}
