import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class BrandArgsDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  clientId: number;
}
