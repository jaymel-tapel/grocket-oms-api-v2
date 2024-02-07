import { Module } from '@nestjs/common';
import { SellersController } from './sellers.controller';
import { SellersReportService } from './services/sellers-report.service';
import { SellersService } from './services/sellers.service';

@Module({
  controllers: [SellersController],
  providers: [SellersReportService, SellersService],
})
export class SellersModule {}
