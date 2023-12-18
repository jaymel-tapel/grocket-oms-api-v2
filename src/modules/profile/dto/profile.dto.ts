import { IsArray, IsString } from 'class-validator';
import { AlternateEmailDto } from 'src/modules/alternate-emails/dto/alternate-email.dto';

export class ProfileDto {
  @IsString()
  name: string;

  @IsArray()
  alternateEmails?: AlternateEmailDto[];
}
