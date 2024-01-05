import { IsArray, IsEmail } from 'class-validator';

export class TransferClientsDto {
  @IsEmail()
  to_seller_email: string;

  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];
}
