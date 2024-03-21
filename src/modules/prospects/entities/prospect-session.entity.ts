import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { ProspectSession } from '@prisma/client';
import { ProspectEntity } from './prospect.entity';

export class ProspectSessionEntity implements ProspectSession {
  constructor(data?: Partial<ProspectSessionEntity>) {
    Object.assign(this, data);

    if (data?.prospects?.length > 0) {
      this.prospects = data.prospects.map(
        (prospect) => new ProspectEntity(prospect),
      );
    }
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  deletedAt: Date | null;

  @ApiProperty()
  keyword: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  orig_limit: number;

  @ApiProperty()
  orig_count: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  count: number;

  @ApiProperty()
  hasWebsites: boolean;

  @ApiHideProperty()
  counter: number;

  @ApiProperty({ type: [ProspectEntity] })
  prospects?: ProspectEntity[];
}
