import { PartialType } from '@nestjs/swagger';
import { CreateOrderReviewDto } from './create-order-review.dto';

export class UpdateOrderReviewDto extends PartialType(CreateOrderReviewDto) {}
