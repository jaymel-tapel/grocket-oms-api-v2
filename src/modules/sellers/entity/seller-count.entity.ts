import { ApiProperty } from '@nestjs/swagger';

export class SellerCountEntity {
  @ApiProperty()
  allSellers: number;

  @ApiProperty()
  activeSellers: number;

  @ApiProperty()
  inactiveSellers: number;
}
