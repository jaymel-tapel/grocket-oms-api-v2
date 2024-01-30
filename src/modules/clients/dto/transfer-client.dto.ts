import { ApiProperty } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsArray, IsEmail, IsNumber } from 'class-validator';

export class TransferClientsDto {
  @IsEmail()
  @DoesExist({ tableName: 'user', column: 'email' })
  @ApiProperty()
  to_seller_email: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @ApiProperty({ isArray: true, type: Number })
  ids: number[];
}
