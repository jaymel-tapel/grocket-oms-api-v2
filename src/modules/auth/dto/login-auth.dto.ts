import { ClientEntity } from '@modules/clients/entities/client.entity';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export class ValidateUserDto extends UserEntity {}
export class ValidateClientDto extends ClientEntity {}
