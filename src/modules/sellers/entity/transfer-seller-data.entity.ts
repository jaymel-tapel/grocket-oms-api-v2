import { ApiProperty } from '@nestjs/swagger';
import { SellerEntity } from './seller.entity';

export class TransferSellerDataEntity {
  constructor({ seller, ...data }: Partial<TransferSellerDataEntity>) {
    Object.assign(this, data);

    if (seller) {
      this.seller = new SellerEntity(seller);
    }
  }

  @ApiProperty()
  seller: SellerEntity;

  @ApiProperty()
  clients: number;

  @ApiProperty()
  orders: number;

  @ApiProperty()
  alternate_emails: number;
}
