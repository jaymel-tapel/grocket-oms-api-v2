import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { $Enums, ClientInfo } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Transform, TransformFnParams } from 'class-transformer';

export class ClientInfoEntity implements ClientInfo {
  constructor(partial: Partial<ClientInfoEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  sourceId: number;

  @ApiPropertyOptional({ default: null })
  phone: string;

  @ApiProperty()
  sentOffer: boolean;

  @ApiProperty()
  hasLoggedIn: boolean;

  @ApiPropertyOptional({ default: null })
  thirdPartyId: string;

  // Private variable to store the original Decimal value
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
}
