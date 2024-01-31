import { ApiProperty } from '@nestjs/swagger';
import { OrderEmailTypeEnum } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, ValidateIf } from 'class-validator';

export class SendEmailByTemplateDto {
  @IsArray()
  @Transform(({ value }) => JSON.parse(value))
  @ValidateIf((o) => o.template === OrderEmailTypeEnum.GESCHEITERT)
  @ApiProperty({ type: [Number] })
  reviewIds: number[];

  @IsEnum(OrderEmailTypeEnum)
  @ApiProperty({ enum: OrderEmailTypeEnum })
  template: OrderEmailTypeEnum;
}
