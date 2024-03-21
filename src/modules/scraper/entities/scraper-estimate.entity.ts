import { ApiProperty } from '@nestjs/swagger';

export class ScraperEstimateEntity {
  @ApiProperty()
  estimated_search: string;

  @ApiProperty()
  estimated_web: string;

  @ApiProperty()
  estimated_email: string;

  @ApiProperty()
  total_estimated_time: string;
}
