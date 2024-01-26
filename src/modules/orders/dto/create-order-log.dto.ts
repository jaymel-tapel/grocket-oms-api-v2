import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderEmailTypeEnum } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateOrderLogDto {
  @IsString()
  @ApiProperty()
  action: string;

  @IsEnum(OrderEmailTypeEnum)
  @ApiPropertyOptional({ enum: OrderEmailTypeEnum })
  email_type?: OrderEmailTypeEnum;
}
