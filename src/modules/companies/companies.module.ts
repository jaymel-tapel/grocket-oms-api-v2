import { forwardRef, Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { ClientsModule } from '@modules/clients/clients.module';
import { CompaniesService } from './services/companies.service';

@Module({
  imports: [forwardRef(() => ClientsModule)],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
