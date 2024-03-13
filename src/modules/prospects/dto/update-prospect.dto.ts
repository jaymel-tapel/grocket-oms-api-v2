import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProspectDto } from './create-prospect.dto';
import { IsOptional } from 'class-validator';
import { DoesExist } from '@src/common/validators/user.validation';

export class UpdateProspectDto extends PartialType(CreateProspectDto) {
  @IsOptional()
  @DoesExist({ tableName: 'prospectTemplate', column: 'id' })
  @ApiPropertyOptional()
  templateId?: number;
}
