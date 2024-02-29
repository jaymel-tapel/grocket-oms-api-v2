import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { ToBoolean } from '@src/common/helpers/toBoolean';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProspectDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional()
  url?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  note?: string;

  @IsOptional()
  @DoesExist({ tableName: 'clientIndustry', column: 'id' })
  @ApiPropertyOptional()
  industryId?: number;

  @DoesExist({ tableName: 'prospectTemplate', column: 'id' })
  @ApiProperty()
  templateId: number;

  @IsOptional()
  @ToBoolean()
  @ApiPropertyOptional()
  auto_send_email?: boolean;

  @ApiHideProperty()
  position?: number;
}
