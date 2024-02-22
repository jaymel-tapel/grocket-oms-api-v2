import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { DateRangeDto } from './date-range.dto';
import { DoesExist } from '@src/common/validators/user.validation';

export class SellerReportDto extends DateRangeDto {
  @IsNotEmpty()
  @DoesExist({ tableName: 'brand', column: 'code' })
  @ApiProperty()
  code: string;
}
