import { ApiProperty } from '@nestjs/swagger';
import { DailyRating } from '@prisma/client';

export class DailyRatingEntity implements DailyRating {
  constructor(data?: Partial<DailyRatingEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  companyId: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviews: number;

  @ApiProperty()
  negative_reviews: number;

  @ApiProperty({ type: [Number], example: [194, 58, 32, 0, 1] })
  stars: number[];
}
