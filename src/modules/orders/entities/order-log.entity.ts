import { ApiProperty } from '@nestjs/swagger';
import { $Enums, OrderLog } from '@prisma/client';

export class OrderLogEntity implements OrderLog {
  constructor(data?: Partial<OrderLogEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  by: string;

  @ApiProperty()
  action: string;

  @ApiProperty({ enum: $Enums.OrderEmailTypeEnum })
  email_type: $Enums.OrderEmailTypeEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
