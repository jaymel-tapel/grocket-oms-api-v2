import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FilterDto } from '@src/common/dtos/search-filter.dto';
import { ToBoolean } from '@src/common/helpers/toBoolean';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum FilterOrderEnum {
  ORDER_ID = 'order_id',
  COMPANY = 'company',
  PAYMENT_STATUS = 'payment_status',
  REVIEW_STATUS = 'review_status',
  REVIEWER_NAME = 'reviewer_name',
  CLIENT = 'client',
  SELLER = 'seller',
  REMARKS = 'remarks',
}

export class FilterOrderDto extends FilterDto {
  @IsNotEmpty()
  @DoesExist({ tableName: 'brand', column: 'code' })
  @ApiProperty()
  code: string;

  @IsOptional()
  @IsEnum(FilterOrderEnum)
  @ApiPropertyOptional({ enum: FilterOrderEnum })
  filter?: FilterOrderEnum;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiPropertyOptional()
  showDeleted?: boolean;
}
