import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class ChartDto {
  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  getInactive?: Boolean;

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  startRange: Date;

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  endRange: Date;

  @IsString()
  @ApiProperty()
  interval: string;
}
