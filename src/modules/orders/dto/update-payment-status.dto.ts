import { PickType } from '@nestjs/swagger';
import { UpdateOrderDto } from './update-order.dto';

export class UpdatePaymentStatusDto extends PickType(UpdateOrderDto, [
  'payment_status',
] as const) {}
