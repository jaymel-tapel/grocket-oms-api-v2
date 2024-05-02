import { Module } from '@nestjs/common';
import { RatingsService } from './services/ratings.service';
import { RatingsController } from './ratings.controller';
import { ScraperModule } from '@modules/scraper/scraper.module';

@Module({
  imports: [ScraperModule],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
