import { DoesExist } from '@src/common/validators/user.validation';
import { IsArray, IsEmail, IsNumber } from 'class-validator';

export class TransferClientsDto {
  @IsEmail()
  @DoesExist({ tableName: 'user', column: 'email' })
  to_seller_email: string;

  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}
