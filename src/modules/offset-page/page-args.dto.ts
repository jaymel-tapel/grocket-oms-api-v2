import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class OffsetPageArgsDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  perPage?: number;
}
