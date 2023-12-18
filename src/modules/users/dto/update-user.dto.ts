import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Prisma } from '@prisma/client';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UpdateUserDto
  extends PartialType(CreateUserDto)
  implements Prisma.UserUpdateInput
{
  @ApiHideProperty()
  @Exclude()
  password?: string;
}
