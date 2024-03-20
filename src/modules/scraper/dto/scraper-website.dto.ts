import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl } from 'class-validator';

export class ScrapeWebsiteDto {
  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional()
  url?: string;
}
