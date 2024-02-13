import { ApiProperty } from '@nestjs/swagger';

class OrdersOverviewEntity {
  @ApiProperty()
  totalOrderCount: number;

  @ApiProperty()
  newOrdersCount: number;

  @ApiProperty()
  paidOrdersCount: number;

  @ApiProperty()
  invoiceOrdersCount: Number;

  @ApiProperty()
  pr1Count: number;

  @ApiProperty()
  pr2Count: number;

  @ApiProperty()
  newOrdersPercent: number;

  @ApiProperty()
  paidOrdersPercent: number;

  @ApiProperty()
  invoiceOrdersPercent: number;

  @ApiProperty()
  pr1Percent: number;

  @ApiProperty()
  pr2Percent: number;
}

class ClientsOverviewEntity {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  industry: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  date: Date;
}

export class AdminDashboardEntity {
  constructor(partial: Partial<AdminDashboardEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  ordersOverview: OrdersOverviewEntity;

  @ApiProperty()
  newclientCount: number;

  @ApiProperty()
  revenue: number;

  @ApiProperty({ type: [ClientsOverviewEntity] })
  clientsOverview: ClientsOverviewEntity[];
}
