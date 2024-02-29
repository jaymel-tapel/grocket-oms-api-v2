import { ApiProperty } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsString } from 'class-validator';

export class CreateProspectLogDto {
  @IsString()
  @ApiProperty()
  action: string;

  @DoesExist({ tableName: 'prospectTemplate', column: 'id' })
  @ApiProperty()
  templateId: number;
}
