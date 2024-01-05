import { CreateUserDto } from './create-user.dto';
import { Prisma } from '@prisma/client';
import { ApiHideProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UpdateUserDto
  extends PartialType(OmitType(CreateUserDto, ['password'] as const))
  implements Prisma.UserUpdateInput
{
  @ApiHideProperty()
  @Exclude()
  password?: string;
}
