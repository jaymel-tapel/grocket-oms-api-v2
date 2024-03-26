import { ApiPropertyOptional } from '@nestjs/swagger';
import { ToBoolean } from '@src/common/helpers/toBoolean';
import { IsOptional } from 'class-validator';

export class FilterProspectLogDto {
  @IsOptional()
  @ToBoolean()
  @ApiPropertyOptional({ default: false })
  fetchAll?: boolean = false;
}
