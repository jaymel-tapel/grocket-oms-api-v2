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
import { ProspectSessionEntity } from '@modules/prospects/entities/prospect-session.entity';

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

    const session = new ProspectSessionEntity(
      await this.prospectSessionService.findOne({
        where: {
          keyword: { equals: data.message, mode: 'insensitive' },
          location: { equals: scraperSearchDto.location, mode: 'insensitive' },
        },
        include: { prospects: true },
      }),
    );

    const prospects: CreateProspectDto[] = data.results.map((result) => ({
      name: result.businessName,
      mapsUrl: result.mapsUrl,
      url: result.website,
    }));

    // * Create a new Session
    if (!session) {
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
    } else {
      // * Insert prospects in Session that doesn't yet exist
      // ? Filter out all the existing prospects and get only the non existing prospects in Session
      const newProspects = prospects.filter(
        (newPros) =>
          !session.prospects.find(
            (existingPros) =>
              existingPros.name.toLowerCase() === newPros.name.toLowerCase(),
          ),
      );

      return await this.prospectSessionService.update(
        session.id,
        {
          count: newProspects.length + session.count,
          prospects: newProspects,
        },
        authUser,
      );
    }
  }

  async getWebsite(id: number, { url }: ScrapeWebsiteDto) {
    const prospect = await this.prospectsService.findOne({ where: { id } });
    const response = await axios.post(process.env.SCRAPER_WEBSITE, {
      url: url ?? prospect.mapsUrl,
    });

    const responseData: ScraperWebsiteEntity = response.data;

    const { website, reviewsInfo, ...data } = responseData;

    // ? Update Prospect's Data
    const updatedProspect = await this.prospectsService.update(prospect.id, {
      url: website,
      stars: reviewsInfo,
      ...data,
    });

    return updatedProspect;
  }

  async getEmails(id: number, { url }: ScrapeEmailDto) {
    const prospect = await this.prospectsService.findOneOrThrow({
      where: { id },
    });
    const response = await axios.post(process.env.SCRAPER_EMAIL, {
      url: url ?? prospect.url,
    });

    const responseData: ScraperEmailEntity = response.data;

    const updatedProspect = await this.prospectsService.update(id, {
      emails: responseData.emails,
    });

    return { emails: updatedProspect.emails };
  }
}
