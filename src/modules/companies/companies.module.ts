import { forwardRef, Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { ClientsModule } from '@modules/clients/clients.module';
import { CompaniesService } from './services/companies.service';
import { EventsModule } from '@modules/events/events.module';

@Module({
  imports: [forwardRef(() => ClientsModule), forwardRef(() => EventsModule)],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
