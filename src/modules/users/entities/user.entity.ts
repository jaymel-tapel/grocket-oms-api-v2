import { ParticipantEntity } from '@modules/participants/entities/participant.entity';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @Exclude()
  password: string;

  @ApiProperty({ enum: $Enums.RoleEnum })
  role: $Enums.RoleEnum;

  @Exclude()
  forgot_password_code: string;

  @ApiPropertyOptional({ nullable: true, default: null })
  profile_image: string;

  @ApiPropertyOptional({ nullable: true, default: null })
  contact_url: string | null;

  @ApiPropertyOptional({ nullable: true, default: null })
  phone: string | null;

  @ApiProperty({ enum: $Enums.StatusEnum })
  status: $Enums.StatusEnum;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ nullable: true, default: null })
  deletedAt: Date | null;

  @ApiProperty({ type: [ParticipantEntity] })
  participants?: ParticipantEntity[];
}

export class SimplifiedUserEntity extends OmitType(UserEntity, [
  'participants',
]) {}

export class PaginatedUserEntity extends PickType(UserEntity, [
  'id',
  'name',
  'email',
] as const) {}
