import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CompanyArgsDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  clientId: number;
}
