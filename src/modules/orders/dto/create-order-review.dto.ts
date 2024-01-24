import { ApiProperty } from '@nestjs/swagger';
import { OrderReviewStatus } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateOrderReviewDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEnum(OrderReviewStatus)
  @ApiProperty()
  status: OrderReviewStatus;

  @IsOptional()
  @IsString()
  google_review_id?: string;
}
