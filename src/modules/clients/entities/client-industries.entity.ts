import { ApiProperty } from '@nestjs/swagger';
import { ClientIndustry } from '@prisma/client';

export class ClientIndustryEntity implements ClientIndustry {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
