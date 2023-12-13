import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Prisma } from '@prisma/client';

export class UpdateUserDto
  extends PartialType(CreateUserDto)
  implements Prisma.UserUpdateInput {}
