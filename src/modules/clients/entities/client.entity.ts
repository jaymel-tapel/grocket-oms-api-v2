import { UserEntity } from '@modules/users/entities/user.entity';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Client } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { ClientInfoEntity } from './client-info.entity';
import { CompanyEntity } from '@modules/companies/entities/company.entity';
import { ParticipantEntity } from '@modules/participants/entities/participant.entity';

export class ClientEntity implements Client {
  constructor(data?: Partial<ClientEntity>) {
    Object.assign(this, data);

    if (data?.seller) {
      this.seller = new UserEntity(data?.seller);
    }

    if (data?.clientInfo) {
      this.clientInfo = new ClientInfoEntity(data?.clientInfo);
    }
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  forgot_password_code: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ nullable: true, default: null })
  deletedAt: Date | null;

  @ApiPropertyOptional({ nullable: true })
  sellerId: number | null;

  @ApiPropertyOptional({ type: () => UserEntity })
  seller?: UserEntity | null;

  @ApiProperty({ type: ClientInfoEntity })
  clientInfo?: Partial<ClientInfoEntity>;

  @ApiProperty({ type: [CompanyEntity] })
  companies?: CompanyEntity[] | null;

  @ApiProperty({ type: [ParticipantEntity] })
  participants?: ParticipantEntity[];
}

export class PaginatedClientEntity extends PickType(ClientEntity, [
  'id',
  'name',
  'email',
] as const) {}

export class ClientEntityWithoutSeller extends OmitType(ClientEntity, [
  'seller',
  'sellerId',
]) {}

export class ClientWithoutRelationsEntity implements Client {
  constructor(data?: Partial<ClientWithoutRelationsEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  forgot_password_code: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  sellerId: number;
}

export class GeneratePasswordEntity {
  constructor(data?: Partial<GeneratePasswordEntity>) {
    Object.assign(this, data);

    if (data.client) {
      this.client = new ClientWithoutRelationsEntity(data.client);
    }
  }

  @ApiProperty()
  client: ClientWithoutRelationsEntity;

  @ApiProperty()
  password_text: string;
}

export class SendGeneratedPasswordEntity {
  @ApiProperty({ example: 'Email sent successfully!' })
  message: string;
}
