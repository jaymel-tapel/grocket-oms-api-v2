import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNumber } from 'class-validator';

export class CreateAlternateEmailDto
  implements Prisma.AlternateEmailCreateInput
{
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNumber()
  @ApiProperty()
  userId: number;

  @Exclude()
  user: Prisma.UserCreateNestedOneWithoutAlternateEmailsInput;
}
