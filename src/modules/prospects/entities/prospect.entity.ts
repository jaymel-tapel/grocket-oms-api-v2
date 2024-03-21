import { ApiProperty } from '@nestjs/swagger';
import { Prospect, ProspectTemplate } from '@prisma/client';
import { ProspectTemplateEntity } from './prospect-template.entity';
import { ProspectReviewerEntity } from './prospect-reviewer.entity';

export class ProspectEntity implements Prospect {
  constructor(data?: Partial<ProspectEntity>) {
    Object.assign(this, data);

    if (data.prospectTemplate) {
      this.prospectTemplate = data.prospectTemplate;
    }

    if (data.reviewers?.length > 0) {
      this.reviewers = data.reviewers.map(
        (rev) => new ProspectReviewerEntity(rev),
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
  sessionId: number;

  @ApiProperty({ nullable: true, default: null })
  industryId: number;

  @ApiProperty()
  templateId: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  emails: string[];

  @ApiProperty({ nullable: true })
  url: string;

  @ApiProperty({ nullable: true })
  phone: string;

  @ApiProperty({ nullable: true })
  mapsUrl: string;

  @ApiProperty({ nullable: true })
  note: string;

  @ApiProperty({ nullable: true })
  rating: number;

  @ApiProperty({ nullable: true })
  reviews: number;

  @ApiProperty({ type: [Number] })
  stars: number[];

  @ApiProperty({ type: [ProspectReviewerEntity] })
  reviewers?: ProspectReviewerEntity[];

  @ApiProperty({ type: ProspectTemplateEntity })
  prospectTemplate?: ProspectTemplate;

  @ApiProperty()
  position: number;
}
