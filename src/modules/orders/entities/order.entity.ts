import { ClientEntity } from '@modules/clients/entities/client.entity';
import { CompanyEntity } from '@modules/companies/entities/company.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, Order } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Transform, TransformFnParams } from 'class-transformer';

export class OrderEntity implements Order {
  constructor({ client, company, ...partial }: Partial<OrderEntity>) {
    Object.assign(this, partial);

    if (client) {
      this.client = new ClientEntity(client);
    }

    if (company) {
      this.company = new CompanyEntity(company);
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
  unit_cost: Decimal;

  @Transform((value: TransformFnParams) => value.value.toNumber(), {
    toPlainOnly: true,
  })
  @ApiProperty({ type: Number })
  total_price: Decimal;

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
}
