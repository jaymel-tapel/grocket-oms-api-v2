import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SellerCountEntity {
  @ApiProperty()
  allSellers: number;

  @ApiProperty()
  activeSellers: number;

  @ApiProperty()
  inactiveSellers: number;
}
