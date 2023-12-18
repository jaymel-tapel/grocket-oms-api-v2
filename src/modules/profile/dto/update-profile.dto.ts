import { PartialType } from '@nestjs/mapped-types';
import { ProfileDto } from './profile.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AlternateEmailDto } from 'src/modules/alternate-emails/dto/alternate-email.dto';

export class UpdateProfileDto extends PartialType(ProfileDto) {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  contact_url?: string;

  @ApiPropertyOptional()
  alternateEmails?: AlternateEmailDto[];
}
