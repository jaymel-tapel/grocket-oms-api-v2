import { ApiProperty } from '@nestjs/swagger';
import { Invoice, Prisma } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';

export class InvoiceEntity implements Invoice {
  constructor(data: Partial<InvoiceEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  invoiceId: string;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  brandId: number;

  @ApiProperty()
  review_names: string[];

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  rate: number;

  @ApiProperty({ type: Number })
  @Transform((value: TransformFnParams) => value.value.toNumber(), {
    toPlainOnly: true,
  })
  amount: Prisma.Decimal;
}
