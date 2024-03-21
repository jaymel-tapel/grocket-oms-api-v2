import axios from 'axios';
import { HttpException, Injectable } from '@nestjs/common';
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
import { isEmpty } from 'lodash';
import { UpdateProspectSession } from '@modules/prospects/dto/update-prospect-session.dto';
import { ScraperEstimateDto } from '../dto/scraper-estimate.dto';

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
          country: { equals: scraperSearchDto.country, mode: 'insensitive' },
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
    if (isEmpty(session)) {
      const createSession: CreateProspectSession = {
        keyword: data.message,
        country: scraperSearchDto.country,
        city: scraperSearchDto.city,
        orig_limit: scraperSearchDto.limit,
        orig_count: data.count,
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

      if (newProspects.length === 0) {
        throw new HttpException(
          'There are no new Prospects for this Session',
          400,
        );
      }

      const updateSession: UpdateProspectSession = {
        limit: scraperSearchDto.limit + session.limit,
        count: newProspects.length + session.prospects.length,
        counter: session.counter + 1,
        prospects: newProspects,
      };

      return await this.prospectSessionService.update(
        session.id,
        updateSession,
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

  async estimate(estimateDto: ScraperEstimateDto) {
    const { limit, no_of_cities } = estimateDto;
    const AVG_TIME_SEARCH = 137.464; // 137.464 - 1000 limit;
    const AVG_TIME_WEB = 13.6;
    const AVG_TIME_EMAIL = 1.97;

    const total_estimated_prospects = limit * no_of_cities;

    const total_estimated_search = total_estimated_prospects / 1000;
    const total_estimated_websites = total_estimated_prospects;
    const total_estimated_emails = total_estimated_prospects;

    const search_in_seconds = +(
      AVG_TIME_SEARCH * total_estimated_search
    ).toFixed(2);
    const web_in_seconds = AVG_TIME_WEB * total_estimated_websites;
    const email_in_seconds = AVG_TIME_EMAIL * total_estimated_emails;

    const estimated_search = this.formatTime(search_in_seconds);
    const estimated_web = this.formatTime(web_in_seconds);
    const estimated_email = this.formatTime(email_in_seconds);

    const total_seconds = search_in_seconds + web_in_seconds + email_in_seconds;
    const total_estimated_time = this.formatTime(total_seconds);

    return {
      estimated_search,
      estimated_web,
      estimated_email,
      total_estimated_time,
    };
  }

  private formatTime(seconds: number): string {
    const days = +(seconds / (3600 * 24)).toFixed(0);
    const remainingSecondsAfterDays = seconds % (3600 * 24);
    const hours = Math.floor(remainingSecondsAfterDays / 3600);
    const remainingSecondsAfterHours = remainingSecondsAfterDays % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const remainingSeconds = Math.floor(remainingSecondsAfterHours % 60);

    const timeParts = [];
    let unit: string;

    if (days > 0) {
      unit = days === 1 ? `day` : `days`;
      timeParts.push(`${days} ${unit}`);
    }
    if (hours > 0) {
      unit = hours === 1 ? `hour` : `hours`;
      timeParts.push(`${hours} ${unit}`);
    }
    if (minutes > 0) {
      unit = minutes === 1 ? `minute` : `minutes`;
      timeParts.push(`${minutes} ${unit}`);
    }
    if (remainingSeconds > 0) {
      unit = remainingSeconds === 1 ? `second` : `seconds`;
      timeParts.push(`${remainingSeconds} ${unit}`);
    }

    return timeParts.join(' ');
  }
}
