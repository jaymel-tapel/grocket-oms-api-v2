import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderReviewStatus } from '@prisma/client';
import { DoesExist } from '@src/common/validators/user.validation';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateOrderReviewDto {
  constructor(data: Partial<CreateOrderReviewDto>) {
    Object.assign(this, data);
  }

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEnum(OrderReviewStatus)
  @ApiProperty()
  status: OrderReviewStatus;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  google_review_id?: string;
}

export class CreateOrderReviewWithOrderIDDto extends CreateOrderReviewDto {
  @DoesExist({ tableName: 'order', column: 'id' })
  @IsNumber()
  @ApiProperty()
  orderId: number;
}
