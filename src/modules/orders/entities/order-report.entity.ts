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

  @ApiProperty()
  total_orders: number;

  @ApiProperty()
  total_paid_orders: number;

  @ApiProperty()
  avg_amount_of_reviews: number;

  @ApiProperty()
  avg_unit_cost: number;

  @ApiProperty({ type: [BaseOrderReport] })
  orders: BaseOrderReport[];

  @ApiProperty({ type: [BaseOrderReport] })
  paidOrders: BaseOrderReport[];
}
