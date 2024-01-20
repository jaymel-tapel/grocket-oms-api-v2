import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, Brand } from '@prisma/client';

export class BrandEntity implements Brand {
  constructor(partial: Partial<BrandEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ nullable: true, default: null })
  deletedAt: Date;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiPropertyOptional({ nullable: true, default: null })
  logo: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ enum: $Enums.CurrencyEnum })
  currency: $Enums.CurrencyEnum;

  @ApiProperty()
  clientId: number;
}
