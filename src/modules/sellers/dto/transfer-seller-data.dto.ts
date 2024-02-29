import { ApiProperty } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsArray, IsEmail } from 'class-validator';

export class TransferSellerDataDto {
  @IsEmail()
  @DoesExist({ tableName: 'user', column: 'email', includeDeleted: true })
  @ApiProperty()
  to_seller_email: string;

  @IsArray()
  @IsEmail({}, { each: true })
  @ApiProperty({ isArray: true, type: String })
  emails: string[];
}
