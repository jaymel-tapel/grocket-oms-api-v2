import { ApiProperty } from '@nestjs/swagger';
import { ClientSource } from '@prisma/client';

export class ClientSourceEntity implements ClientSource {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
