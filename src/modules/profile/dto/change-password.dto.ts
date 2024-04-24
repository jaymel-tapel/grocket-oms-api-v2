import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { IsSameAs } from 'src/common/validators/confirmPassword.validation';

export class ChangePasswordDto {
  @IsString()
  @ApiProperty()
  old_password: string;

  @IsString()
  @MinLength(8)
  @ApiProperty()
  new_password: string;

  @IsString()
  @MinLength(8)
  @IsSameAs<keyof ChangePasswordDto>('new_password')
  @ApiProperty()
  confirm_password: string;
}
