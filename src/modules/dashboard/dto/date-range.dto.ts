import { DateRangeDto } from '@modules/sellers/dto/date-range.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DashboardDateRangeDto {
  @IsOptional()
  // @IsDate()
  @IsString()
  @ApiPropertyOptional()
  startRange?: any;

  @IsOptional()
  // @IsDate()
  @IsString()
  @ApiPropertyOptional()
  endRange?: any;

  @IsNotEmpty()
  @DoesExist({ tableName: 'brand', column: 'code' })
  @ApiProperty()
  code: string;
}
