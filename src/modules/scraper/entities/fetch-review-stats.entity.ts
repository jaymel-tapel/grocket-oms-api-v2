import { ApiProperty } from '@nestjs/swagger';
import { IPlaceInfo } from '../interfaces/place-info.interface';

export class FetchReviewStatsEntity {
  constructor(data?: Partial<FetchReviewStatsEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty()
  placeInfo: IPlaceInfo;

  @ApiProperty()
  reviews: number[];
}
