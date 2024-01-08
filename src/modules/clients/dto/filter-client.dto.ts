import { ApiPropertyOptional } from '@nestjs/swagger';
import { FilterDto } from '@src/common/dtos/search-filter.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export enum FilterClientEnum {
  SELLER = 'seller',
}

export class FilterClientsDto extends FilterDto<FilterClientEnum> {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  clientLoggedIn?: boolean;
}
