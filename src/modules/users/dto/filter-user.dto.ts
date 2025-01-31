import { ApiPropertyOptional } from '@nestjs/swagger';
import { FilterDto } from '@src/common/dtos/search-filter.dto';
import { ToBoolean } from '@src/common/helpers/toBoolean';
import { IsCorrectTypeForEachEnum } from '@src/common/validators/enum.validation';
import { IsBoolean, IsEnum, IsOptional, ValidateIf } from 'class-validator';

export enum FilterUserEnum {
  ID = 'id',
  EMAIL = 'email',
}

export class FilterUsersDto extends FilterDto {
  @IsOptional()
  @IsEnum(FilterUserEnum)
  @IsCorrectTypeForEachEnum(FilterUserEnum)
  @ValidateIf((o) => o.keyword !== undefined)
  @ApiPropertyOptional({ enum: FilterUserEnum })
  filter?: FilterUserEnum;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiPropertyOptional()
  showInactive?: boolean;
}
