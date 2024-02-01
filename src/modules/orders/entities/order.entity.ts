import { ClientEntity } from '@modules/clients/entities/client.entity';
import { CompanyEntity } from '@modules/companies/entities/company.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, Order, Prisma } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';
import { OrderReviewEntity } from './order-review.entity';

export class OrderEntity implements Order {
  constructor({
    client,
    company,
    orderReviews,
    ...partial
  }: Partial<OrderEntity>) {
    Object.assign(this, partial);

    if (client) {
      this.client = new ClientEntity(client);
    }

    if (company) {
      this.company = new CompanyEntity(company);
    }

    if (orderReviews) {
      this.orderReviews = orderReviews.map(
        (review) => new OrderReviewEntity(review),
      );

      this.orderReviewCount = this.orderReviews.length;
    }
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  clientId: number;

  @ApiProperty()
  companyId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ nullable: true, default: null })
  deletedAt: Date | null;

  @ApiPropertyOptional({ nullable: true, default: null })
  order_date: Date | null;

  @ApiProperty({ enum: $Enums.OrderCreatedByEnum })
  createdBy: $Enums.OrderCreatedByEnum;

  @ApiProperty({ default: false })
  send_confirmation: boolean;

  @Transform((value: TransformFnParams) => value.value.toNumber(), {
    toPlainOnly: true,
  })
  @ApiProperty({ type: Number })
  unit_cost: Prisma.Decimal;

  @Transform((value: TransformFnParams) => value.value.toNumber(), {
    toPlainOnly: true,
  })
  @ApiProperty({ type: Number })
  total_price: Prisma.Decimal;

  @ApiPropertyOptional({ nullable: true, default: null })
  remarks: string;

  @ApiProperty({ enum: $Enums.PaymentStatusEnum })
  payment_status: $Enums.PaymentStatusEnum;

  @ApiPropertyOptional({ nullable: true, default: null })
  payment_status_date: Date | null;

  @ApiPropertyOptional({ nullable: true, default: null })
  date_paid: Date | null;

  @ApiPropertyOptional({ nullable: true, default: null })
  invoice_image: string | null;

  @ApiPropertyOptional({ type: ClientEntity })
  client?: ClientEntity;

  @ApiPropertyOptional({ type: CompanyEntity })
  company?: CompanyEntity;

  @ApiPropertyOptional({ type: OrderReviewEntity, isArray: true })
  orderReviews?: OrderReviewEntity[];

  @ApiPropertyOptional()
  orderReviewCount?: number;
}
