import {
  AlternateEmailEntity,
  AlternateEmailEntityWithoutRelation,
} from '@modules/alternate-emails/entities/alternate-email.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class SellerEntity implements User {
  constructor(partial: Partial<SellerEntity>) {
    Object.assign(this, partial);

    if (partial.alternateEmails?.length > 0) {
      this.alternateEmails = partial.alternateEmails.map(
        (alterEmail) => new AlternateEmailEntity(alterEmail),
      );
    }
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ nullable: true, default: null })
  deletedAt: Date | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @Exclude()
  password: string;

  @ApiProperty()
  role: $Enums.RoleEnum;

  @Exclude()
  forgot_password_code: string;

  @ApiPropertyOptional({ nullable: true })
  profile_image: string | null;

  @ApiPropertyOptional({ nullable: true })
  contact_url: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone: string | null;

  @ApiProperty()
  status: $Enums.StatusEnum;

  @ApiProperty({ type: [AlternateEmailEntityWithoutRelation] })
  alternateEmails?: AlternateEmailEntity[];
}
