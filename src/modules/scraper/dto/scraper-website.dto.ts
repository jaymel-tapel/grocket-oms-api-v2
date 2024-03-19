import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class ScrapeWebsiteDto {
  @IsUrl()
  @ApiProperty()
  url: string;
}
