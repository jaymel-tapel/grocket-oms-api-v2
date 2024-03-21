import { ApiProperty } from '@nestjs/swagger';
import { ProspectTemplate } from '@prisma/client';
import { ProspectEntity } from './prospect.entity';

export class ProspectTemplateEntity implements ProspectTemplate {
  constructor(data?: Partial<ProspectTemplateEntity>) {
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

  @ApiProperty({ nullable: true, default: null })
  deletedAt: Date;

  @ApiProperty()
  name: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: [ProspectEntity] })
  prospects?: ProspectEntity[];
}
