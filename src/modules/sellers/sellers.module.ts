import { Module } from '@nestjs/common';
import { SellersController } from './sellers.controller';
import { SellersReportService } from './services/sellers-report.service';
import { SellersService } from './services/sellers.service';
import { AlternateEmailsModule } from '@modules/alternate-emails/alternate-emails.module';

@Module({
  imports: [AlternateEmailsModule],
  controllers: [SellersController],
  providers: [SellersReportService, SellersService],
})
export class SellersModule {}
