import { ApiProperty } from '@nestjs/swagger';

class ActiveSellerEntity {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  activeSellerCount: Number;
}

class InactiveSellerEntity {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  inactiveSellerCount: Number;
}

export class ChartDetailEntity {
  constructor(partial: Partial<ChartDetailEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ type: [ActiveSellerEntity] })
  activeSellerCount: ActiveSellerEntity[];

  @ApiProperty({ type: [InactiveSellerEntity] })
  inactiveSellerCount: InactiveSellerEntity[];
}
