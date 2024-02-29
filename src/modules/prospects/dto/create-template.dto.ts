import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateProspectTemplateDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  subject: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  content?: string;
}
