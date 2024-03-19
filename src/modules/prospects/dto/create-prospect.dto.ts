import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsArray, IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProspectDto {
  constructor(data?: Partial<CreateProspectDto>) {
    Object.assign(this, data);
  }

  @IsString()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  @ApiPropertyOptional()
  emails?: string[];

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

  @ApiHideProperty()
  position?: number;
}
