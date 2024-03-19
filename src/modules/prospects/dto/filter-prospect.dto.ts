import { ApiPropertyOptional } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsNumber, IsOptional } from 'class-validator';

export class FilterProspectDto {
  @IsOptional()
  @IsNumber()
  @DoesExist({ tableName: 'prospectSession', column: 'id' })
  @ApiPropertyOptional()
  sessionId?: number;
}
