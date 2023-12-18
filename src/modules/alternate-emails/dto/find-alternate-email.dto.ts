import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FindAlternateDto {
  @IsOptional()
  @ApiPropertyOptional()
  userId?: number;

  @IsOptional()
  @ApiPropertyOptional()
  email?: string;
}
