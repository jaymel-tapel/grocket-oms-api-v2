import { Module } from '@nestjs/common';
import { ScraperService } from './services/scraper.service';
import { ScraperController } from './scraper.controller';
import { ProspectsModule } from '@modules/prospects/prospects.module';

@Module({
  imports: [ProspectsModule],
  controllers: [ScraperController],
  providers: [ScraperService],
})
export class ScraperModule {}
