import { ApiHideProperty, PartialType } from '@nestjs/swagger';
import { CreateAlternateEmailDto } from './create-alternate-email.dto';
import { Prisma } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UpdateAlternateEmailDto
  extends PartialType(CreateAlternateEmailDto)
  implements Prisma.AlternateEmailUpdateInput
{
  @Exclude()
  @ApiHideProperty()
  userId?: number;
}
