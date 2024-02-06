import { ApiProperty } from '@nestjs/swagger';
import { OrderReviewStatus, PaymentStatusEnum } from '@prisma/client';

class BaseOutput {
  @ApiProperty()
  count: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  percentage: number;
}

class OrderPaymentStatusEntity extends BaseOutput {
  @ApiProperty({ enum: PaymentStatusEnum })
  payment_status: PaymentStatusEnum;
}

class OrderReviewStatusEntity extends BaseOutput {
  @ApiProperty({ enum: OrderReviewStatus })
  order_review_status: OrderReviewStatus;
}

export class OrderGraphEntity {
  constructor(data: Partial<OrderGraphEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty({ type: [OrderPaymentStatusEntity] })
  orderPaymentStatus: OrderPaymentStatusEntity[];

  @ApiProperty({ type: [OrderReviewStatusEntity] })
  orderReviewStatus: OrderReviewStatusEntity[];
}
