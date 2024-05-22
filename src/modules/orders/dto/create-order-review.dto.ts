import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { DoesExist } from '@src/common/validators/user.validation';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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
  @IsEnum($Enums.OrderReviewStatus)
  @ApiProperty()
  status: $Enums.OrderReviewStatus;

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
