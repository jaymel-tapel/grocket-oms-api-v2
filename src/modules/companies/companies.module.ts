import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { ClientsModule } from '@modules/clients/clients.module';
import { CompaniesService } from './services/companies.service';
import { CompanyEventsService } from '@modules/events/services/company-events.service';

@Module({
  imports: [
    ClientsModule,
  ],
  controllers: [CompaniesController],
  providers: [
    CompaniesService,
    CompanyEventsService
  ],
  exports: [CompaniesService],
})
export class CompaniesModule {}
