import { ApiPropertyOptional } from '@nestjs/swagger';
import { ToBoolean } from '@src/common/helpers/toBoolean';
import { IsOptional } from 'class-validator';

export class FilterSessionOptions {
  @IsOptional()
  @ToBoolean()
  @ApiPropertyOptional()
  withTrashed?: boolean;
}
export class FilterSessionManyOptions extends FilterSessionOptions {
  @IsOptional()
  @ToBoolean()
  @ApiPropertyOptional()
  latest?: boolean;
}
