import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FilterDto } from '@src/common/dtos/search-filter.dto';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum FilterClientEnum {
  SELLER = 'seller',
}

export class FilterClientsDto extends FilterDto {
  @IsOptional()
  @IsEnum(FilterClientEnum)
  @ApiPropertyOptional()
  filter?: FilterClientEnum;

  @IsNotEmpty()
  @DoesExist({ tableName: 'brand', column: 'code' })
  @ApiProperty()
  code: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  clientLoggedIn?: boolean;
}
