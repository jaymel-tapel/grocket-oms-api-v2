import { ApiProperty } from '@nestjs/swagger';

export class SellerVolatilityEntity {
  @ApiProperty()
  sellerVolatility: number;

  @ApiProperty()
  activeSellerVolatility: number;

  @ApiProperty()
  inactiveSellerVolatility: number;
}
