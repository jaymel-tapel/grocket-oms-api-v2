import { Module } from '@nestjs/common';
import { SellersController } from './sellers.controller';
import { SellersService } from './services/sellers.service';

@Module({
  controllers: [SellersController],
  providers: [SellersService],
})
export class SellersModule {}
