import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Max, Min } from 'class-validator';

export class ScraperSearchDto {
  @IsString()
  @ApiProperty()
  location: string;

  @IsString()
  @ApiProperty()
  search: string;

  @IsNumber()
  @Max(1080)
  @Min(1)
  @ApiProperty()
  limit: number;
}