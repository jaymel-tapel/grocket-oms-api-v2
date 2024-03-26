import { ApiProperty } from '@nestjs/swagger';
import { ProspectLog } from '@prisma/client';

export class ProspectLogsEntity implements ProspectLog {
  constructor(data?: Partial<ProspectLogsEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @ApiProperty()
  prospectId: number;

  @ApiProperty()
  template: string;

  @ApiProperty()
  by: string;

  @ApiProperty()
  action: string;
}
