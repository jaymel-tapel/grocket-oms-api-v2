import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../users/entities/user.entity';
import { ScraperSearchDto } from '../dto/scraper-search.dto';
import { ScraperSearchEntity } from '../entities/scraper-search.entity';
import { CreateProspectDto } from '@modules/prospects/dto/create-prospect.dto';
import { ProspectsService } from '../../prospects/services/prospects.service';
import { CreateProspectSession } from '@modules/prospects/dto/create-prospect-session.dto';
import { ProspectSessionService } from '../../prospects/services/prospect-session.service';
import { ScrapeWebsiteDto } from '../dto/scraper-website.dto';
import { ScraperWebsiteEntity } from '../entities/scraper-website.entity';
import { ScrapeEmailDto } from '../dto/scraper-email.dto';
import { ScraperEmailEntity } from '../entities/scraper-email.entity';

@Injectable()
export class ScraperService {
  constructor(
    private readonly prospectsService: ProspectsService,
    private readonly prospectSessionService: ProspectSessionService,
  ) {}

  async search(authUser: UserEntity, scraperSearchDto: ScraperSearchDto) {
    const response = await axios.post(process.env.SCRAPER_SEARCH, {
      userId: authUser.id,
      ...scraperSearchDto,
    });

    const data: ScraperSearchEntity = response.data;

    const prospects: CreateProspectDto[] = data.results.map((result) => ({
      name: result.businessName,
      mapsUrl: result.mapsUrl,
      url: result.website,
    }));

    const createSession: CreateProspectSession = {
      keyword: data.message,
      location: scraperSearchDto.location,
      limit: scraperSearchDto.limit,
      count: data.count,
      hasWebsites: data.hasWebSites,
      prospects,
    };

    // ? Save it to the database
    return await this.prospectSessionService.create(createSession, authUser);
  }

  async getWebsite(id: number, { url }: ScrapeWebsiteDto) {
    const prospect = await this.prospectsService.findOne({ where: { id } });

    const response = await axios.post(process.env.SCRAPER_WEBSITE, { url });

    const responseData: ScraperWebsiteEntity = response.data;

    const { website, reviewsInfo, ...data } = responseData;

    // ? Update Prospect's Data
    return await this.prospectsService.update(prospect.id, {
      url: website,
      stars: reviewsInfo,
      ...data,
    });
  }

  async getEmails(id: number, { url }: ScrapeEmailDto) {
    const response = await axios.post(process.env.SCRAPER_EMAIL, { url });

    const responseData: ScraperEmailEntity = response.data;

    const prospect = await this.prospectsService.update(id, {
      emails: responseData.emails,
    });

    return prospect.emails;
  }
}
