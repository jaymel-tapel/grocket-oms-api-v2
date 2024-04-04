import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class ScraperEstimateDto {
  @IsNumber()
  @Min(1)
  @Max(3000)
  @ApiProperty()
  limit: number;

  @IsNumber()
  @Min(1)
  @ApiProperty()
  no_of_cities: number;
}
