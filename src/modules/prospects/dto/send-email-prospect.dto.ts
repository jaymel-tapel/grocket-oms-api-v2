import { ApiProperty } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsNumber } from 'class-validator';

export class SendManualEmailProspectDto {
  @IsNumber()
  @DoesExist({ tableName: 'prospectTemplate', column: 'id' })
  @ApiProperty()
  templateId: number;
}
