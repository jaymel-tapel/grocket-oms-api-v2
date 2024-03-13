import { ApiProperty } from '@nestjs/swagger';
import { Prospect, ProspectTemplate } from '@prisma/client';
import { ProspectTemplateEntity } from './prospect-template.entity';

export class ProspectEntity implements Prospect {
  constructor(data?: Partial<ProspectEntity>) {
    Object.assign(this, data);

    if (data.prospectTemplate) {
      this.prospectTemplate = data.prospectTemplate;
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
  email: string[];

  @ApiProperty({ nullable: true })
  url: string;

  @ApiProperty({ nullable: true })
  phone: string;

  @ApiProperty({ nullable: true })
  note: string;

  @ApiProperty({ default: false })
  auto_send_email: boolean;

  @ApiProperty({ type: ProspectTemplateEntity })
  prospectTemplate?: ProspectTemplate;

  @ApiProperty()
  position: number;
}
