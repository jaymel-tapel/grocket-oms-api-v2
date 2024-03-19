import { ApiProperty } from '@nestjs/swagger';

export class ScraperEmailEntity {
  constructor(data?: Partial<ScraperEmailEntity>) {
    this.emails = data.emails;
  }

  @ApiProperty()
  emails: string[];
}
