import { ApiProperty } from '@nestjs/swagger';

class BaseOrderReport {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  count: number;
}

export class OrderReportEntity {
  constructor(data: Partial<OrderReportEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty({ type: [BaseOrderReport] })
  orders: BaseOrderReport[];

  @ApiProperty({ type: [BaseOrderReport] })
  paidOrders: BaseOrderReport[];
}
