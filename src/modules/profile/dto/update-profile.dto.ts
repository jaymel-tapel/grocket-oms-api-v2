import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';
import { AlternateEmailDto } from 'src/modules/alternate-emails/dto/alternate-email.dto';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({ format: 'email' })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  phone?: string;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional()
  contact_url?: string;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional()
  alternateEmails?: AlternateEmailDto[];
}
