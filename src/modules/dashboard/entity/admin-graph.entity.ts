import { ApiProperty } from '@nestjs/swagger';

class PaidReviewsEntity {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  paidReviewsCount: number;
}

class UnpaidReviewsEntity {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  unpaidReviewsCount: number;
}

export class AdminGraphEntity {
  @ApiProperty()
  receivedAmount: number;

  @ApiProperty()
  unpaidAmount: number;

  @ApiProperty({ type: [PaidReviewsEntity] })
  paidReviews: PaidReviewsEntity[];

  @ApiProperty({ type: [UnpaidReviewsEntity] })
  unpaidReviews: UnpaidReviewsEntity[];
}
