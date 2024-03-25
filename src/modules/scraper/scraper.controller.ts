import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScraperService } from './services/scraper.service';
import { JwtGuard } from '@modules/auth/guard';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ScraperSearchDto } from './dto/scraper-search.dto';
import { ScraperWebsiteEntity } from './entities/scraper-website.entity';
import { ScrapeWebsiteDto } from './dto/scraper-website.dto';
import { ProspectSessionEntity } from '@modules/prospects/entities/prospect-session.entity';
import { ScraperEmailEntity } from './entities/scraper-email.entity';
import { ScrapeEmailDto } from './dto/scraper-email.dto';
import { ScraperEstimateDto } from './dto/scraper-estimate.dto';
import { ScraperEstimateEntity } from './entities/scraper-estimate.entity';

@UseGuards(JwtGuard)
@Controller('scraper')
@ApiTags('scraper')
@ApiBearerAuth()
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('search')
  @ApiOkResponse({ type: ProspectSessionEntity })
  async search(
    @AuthUser() authUser: UserEntity,
    @Body() scraperSearchDto: ScraperSearchDto,
  ) {
    return this.scraperService.search(authUser, scraperSearchDto);
  }

  @Post('website/:prospectId')
  @ApiOkResponse({ type: ScraperWebsiteEntity })
  async getWebsite(
    @Param('prospectId', ParseIntPipe) id: number,
    @Body() scrapeWebsiteDto: ScrapeWebsiteDto,
  ) {
    const prospect = await this.scraperService.getWebsite(id, scrapeWebsiteDto);
    return ScraperWebsiteEntity.fromProspect(prospect);
  }

  @Post('email/:prospectId')
  @ApiOkResponse({ type: ScraperEmailEntity })
  async getEmails(
    @Param('prospectId', ParseIntPipe) id: number,
    @Body() scrapeEmailDto: ScrapeEmailDto,
  ) {
    return await this.scraperService.getEmails(id, scrapeEmailDto);
  }

  @Get('estimate')
  @ApiOkResponse({ type: ScraperEstimateEntity })
  async estimate(@Query() estimateDto: ScraperEstimateDto) {
    return this.scraperService.estimate(estimateDto);
  }
}
