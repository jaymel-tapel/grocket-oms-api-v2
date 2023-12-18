import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class AlternateEmailDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}
