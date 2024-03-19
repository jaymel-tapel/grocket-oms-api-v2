import { ApiProperty } from '@nestjs/swagger';

export class IReviewers {
  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  google_review_id: string;
}
