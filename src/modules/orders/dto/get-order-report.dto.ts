import { DateRangeDto } from '@modules/sellers/dto/date-range.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsOptional } from 'class-validator';

export class OrderReportDateRangeDto extends DateRangeDto {
  @IsOptional()
  @DoesExist({ tableName: 'user', column: 'id' })
  @ApiPropertyOptional()
  sellerId?: number;
}
