import { ApiProperty } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsNumber } from 'class-validator';

export class FilterSessionDto {
  @IsNumber()
  @DoesExist({ tableName: 'prospectSession', column: 'id' })
  @ApiProperty()
  id: number;
}
