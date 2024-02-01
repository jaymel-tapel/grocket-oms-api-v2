import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, OrderReview } from '@prisma/client';

export class OrderReviewEntity implements OrderReview {
  constructor(data: Partial<OrderReviewEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: $Enums.OrderReviewStatus })
  status: $Enums.OrderReviewStatus;

  @ApiPropertyOptional({ default: null, nullable: true })
  google_review_id: string | null;
}
