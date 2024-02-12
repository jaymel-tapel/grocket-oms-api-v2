import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

class DateRange {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiPropertyOptional()
  startRange?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiPropertyOptional()
  endRange?: Date;
}

export class DateRangeDto extends PartialType(DateRange) {}
