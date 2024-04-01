import { ApiProperty } from '@nestjs/swagger';
import { IItem } from '../interfaces/scraper-search.interface';

export class ScraperSearchEntity {
  constructor(data?: Partial<ScraperSearchEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty()
  location: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  hasWebSites: boolean;

  @ApiProperty()
  count: number;

  @ApiProperty({ type: [IItem] })
  results: IItem[];
}
