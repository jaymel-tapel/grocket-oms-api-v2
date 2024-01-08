import { ApiPropertyOptional } from '@nestjs/swagger';
import { FilterDto } from '@src/common/dtos/search-filter.dto';
import { IsEnum, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export enum FilterUserEnum {
  ID = 'id',
  EMAIL = 'email',
}

export class FilterUsersDto extends FilterDto {
  @IsOptional()
  @IsEnum(FilterUserEnum)
  @ApiPropertyOptional()
  filter?: FilterUserEnum;

  @IsNotEmpty()
  @ValidateIf((o) => o.filter !== undefined)
  keyword?: string;
}
