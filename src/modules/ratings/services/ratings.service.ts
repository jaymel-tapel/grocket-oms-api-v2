import { Injectable } from '@nestjs/common';
import { CreateRatingsDto } from '../dto/create-rating.dto';
import { PrismaDynamicClient } from '@src/common/types/prisma.types';
import { DatabaseService } from '@modules/database/services/database.service';
import { ScraperService } from '@modules/scraper/services/scraper.service';

@Injectable()
export class RatingsService {
  private database: PrismaDynamicClient;

  private async initDatabase() {
    this.database = await this.db.softDelete();
  }

  constructor(
    private readonly db: DatabaseService,
    private readonly scraperService: ScraperService,
  ) {
    this.initDatabase();
  }

  async getOrCreateRatings(companyId: number) {
    const company = await this.database.company.findFirst({
      where: { id: companyId },
      include: {
        dailyRatings: {
          take: 1,
          orderBy: { date: 'desc' },
        },
      },
    });

    const rating = company.dailyRatings[0];

    if (rating && rating?.stars.length > 0) {
      return rating;
    }

    const data = await this.scraperService.fetchReviewStats(company.url);

    const placeInfo = data.placeInfo;
    const reviews = data.reviews;

    const negative_reviews = reviews[3] + reviews[4];

    // ? Create a new rating
    const newRating = await this.create({
      companyId,
      rating: parseFloat(placeInfo.rating),
      reviews: placeInfo.reviews,
      negative_reviews,
      stars: reviews,
    });

    await this.database.company.update({
      where: { id: companyId },
      data: { valid_url: true, check_url: true },
    });

    return newRating;
  }

  async create(createRatingsDto: CreateRatingsDto) {
    return await this.database.$transaction(async (tx) => {
      return await tx.dailyRating.create({
        data: createRatingsDto,
      });
    });
  }
}
