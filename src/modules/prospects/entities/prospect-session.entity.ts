import { ApiProperty } from '@nestjs/swagger';
import { ProspectSession } from '@prisma/client';
import { ProspectEntity } from './prospect.entity';

export class ProspectSessionEntity implements ProspectSession {
  constructor(data?: Partial<ProspectSessionEntity>) {
    Object.assign(this, data);

    if (data.prospects) {
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
  location: string;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  count: number;

  @ApiProperty()
  hasWebsites: boolean;

  @ApiProperty({ type: [ProspectEntity] })
  prospects?: ProspectEntity[];
}
