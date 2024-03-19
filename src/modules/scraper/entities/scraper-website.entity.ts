import { ApiProperty } from '@nestjs/swagger';
import { IReviewers } from '../interfaces/scraper-website.interface';
import { ProspectEntity } from '@modules/prospects/entities/prospect.entity';

export class ScraperWebsiteEntity {
  constructor(data?: Partial<ScraperWebsiteEntity>) {
    this.website = data.website;
    this.phone = data.phone;
    this.rating = data.rating;
    this.reviews = data.reviews;
    this.reviewsInfo = data.reviewsInfo;
    this.reviewers = data.reviewers;
  }

  static fromProspect(prospect: ProspectEntity): ScraperWebsiteEntity {
    const { url, stars } = prospect;
    return new ScraperWebsiteEntity({
      website: url,
      reviewsInfo: stars,
      ...prospect,
    });
  }

  @ApiProperty({ nullable: true })
  website: string | null;

  @ApiProperty({ nullable: true })
  phone: string | null;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviews: number;

  @ApiProperty({ type: [Number] })
  reviewsInfo: number[];

  @ApiProperty({ type: [IReviewers] })
  reviewers: IReviewers[];
}
