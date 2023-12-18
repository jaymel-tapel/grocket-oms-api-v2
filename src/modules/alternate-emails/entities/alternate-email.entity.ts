import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlternateEmail } from '@prisma/client';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export class AlternateEmailEntity implements AlternateEmail {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @ApiPropertyOptional({ nullable: true })
  userId: number | null;

  @ApiPropertyOptional({ type: UserEntity })
  user?: UserEntity | null;

  constructor({ user, ...data }: Partial<AlternateEmailEntity>) {
    Object.assign(this, data);

    if (user) {
      this.user = new UserEntity(user);
    }
  }
}
