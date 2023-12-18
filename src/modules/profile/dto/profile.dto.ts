import { IsArray, IsString, IsUrl } from 'class-validator';
import { AlternateEmailDto } from 'src/modules/alternate-emails/dto/alternate-email.dto';

export class ProfileDto {
  @IsString()
  name: string;

  @IsString()
  phone?: string;

  @IsUrl()
  contact_url?: string;

  @IsArray()
  alternateEmails?: AlternateEmailDto[];
}
