import { ApiProperty } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsEmail, IsOptional } from 'class-validator';

export class CreateParticipantDto {
  @IsOptional()
  @IsEmail()
  @DoesExist({ tableName: 'user', column: 'email' })
  user_email?: string;

  @IsOptional()
  @IsEmail()
  @DoesExist({ tableName: 'client', column: 'email' })
  @ApiProperty()
  client_email?: string;
}
