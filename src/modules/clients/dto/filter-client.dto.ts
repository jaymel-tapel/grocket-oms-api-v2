import { ApiPropertyOptional } from '@nestjs/swagger';
import { FilterDto } from '@src/common/dtos/search-filter.dto';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export enum FilterClientEnum {
  SELLER = 'seller',
}

export class FilterClientsDto extends FilterDto {
  @IsOptional()
  @IsEnum(FilterClientEnum)
  @ApiPropertyOptional()
  filter?: FilterClientEnum;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  clientLoggedIn?: boolean;

  @IsNotEmpty()
  @ValidateIf((o) => o.filter !== undefined)
  keyword?: string;
}
