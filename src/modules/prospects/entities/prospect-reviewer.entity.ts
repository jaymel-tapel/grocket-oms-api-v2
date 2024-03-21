import { ApiProperty } from '@nestjs/swagger';
import { ProspectReviewer } from '@prisma/client';

export class ProspectReviewerEntity implements ProspectReviewer {
  constructor(data: ProspectReviewerEntity) {
    Object.assign(this, data);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  prospectId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  google_review_id: string;
}
