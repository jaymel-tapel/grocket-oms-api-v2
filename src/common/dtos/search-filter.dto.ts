import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class FilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  keyword?: string;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional({ type: Date })
  from?: Date;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional()
  to?: Date;

  @IsOptional()
  @ApiPropertyOptional()
  options?: any;
}
