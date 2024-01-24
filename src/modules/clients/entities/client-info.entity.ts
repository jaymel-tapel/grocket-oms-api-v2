import { BrandEntity } from '@modules/brands/entities/brand.entity';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { $Enums, ClientInfo } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Transform, TransformFnParams } from 'class-transformer';

export class ClientInfoEntity implements ClientInfo {
  constructor({ brand, ...partial }: Partial<ClientInfoEntity>) {
    Object.assign(this, partial);

    if (brand) {
      this.brand = new BrandEntity(brand);
    }
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  sourceId: number;

  @ApiProperty()
  industryId: number;

  @ApiPropertyOptional({ default: null })
  phone: string;

  @ApiProperty()
  sentOffer: boolean;

  @ApiProperty()
  hasLoggedIn: boolean;

  @ApiPropertyOptional({ default: null })
  thirdPartyId: string;

  @ApiProperty({ type: Number })
  @Transform((value: TransformFnParams) => value.value.toNumber(), {
    toPlainOnly: true,
  })
  default_unit_cost: Decimal;

  @ApiProperty({ enum: $Enums.StatusEnum })
  status: $Enums.StatusEnum;

  @ApiProperty({ enum: $Enums.LanguageEnum })
  language: $Enums.LanguageEnum;

  @ApiProperty({ enum: $Enums.TierEnum })
  tier: $Enums.TierEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ nullable: true, default: null })
  deletedAt: Date | null;

  @ApiHideProperty()
  clientId: number;

  @ApiProperty()
  brandId: number;

  @ApiPropertyOptional({ type: BrandEntity })
  brand?: BrandEntity;
}
