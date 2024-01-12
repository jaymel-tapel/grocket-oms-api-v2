import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class FetchCompletedTasksDto {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  completed?: boolean;
}
