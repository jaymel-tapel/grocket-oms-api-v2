import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class SellerCountDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiProperty()
  startRange?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiProperty()
  endRange?: Date;
}
