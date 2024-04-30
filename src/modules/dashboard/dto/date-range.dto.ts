import { DateRangeDto } from '@modules/sellers/dto/date-range.dto';
import { ApiProperty } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsNotEmpty } from 'class-validator';

export class DashboardDateRangeDto extends DateRangeDto {
  @IsNotEmpty()
  @DoesExist({ tableName: 'brand', column: 'code' })
  @ApiProperty()
  code: string;
}
