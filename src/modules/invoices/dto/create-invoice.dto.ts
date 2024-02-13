import { ApiProperty } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsNumber } from 'class-validator';

export class CreateInvoiceDto {
  @IsNumber()
  @DoesExist({ tableName: 'order', column: 'id' })
  @ApiProperty()
  orderId: number;
}
