import { DateRangeDto } from '@modules/sellers/dto/date-range.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToBoolean } from '@src/common/helpers/toBoolean';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class OrderReportDateRangeDto extends DateRangeDto {
  @IsOptional()
  @DoesExist({ tableName: 'user', column: 'id' })
  @ApiPropertyOptional()
  sellerId?: number;

  @IsNotEmpty()
  @DoesExist({ tableName: 'brand', column: 'code' })
  @ApiProperty()
  code: string;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiPropertyOptional()
  showDeleted?: boolean;
}
