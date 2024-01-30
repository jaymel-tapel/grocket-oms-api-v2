import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class OffsetPageArgsDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  page?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  perPage?: number;
}
