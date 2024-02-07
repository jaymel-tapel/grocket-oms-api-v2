import { ApiPropertyOptional } from '@nestjs/swagger';
import { FilterDto } from '@src/common/dtos/search-filter.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class FilterSellersDto extends FilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  keyword?: string;
}
