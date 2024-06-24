import {
  SimplifiedUserEntity,
  UserEntity,
} from '@modules/users/entities/user.entity';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Client } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { ClientInfoEntity } from './client-info.entity';
import { SimplifiedCompanyEntity } from '@modules/companies/entities/company.entity';
import { ParticipantEntity } from '@modules/participants/entities/participant.entity';
import { format } from 'date-fns';

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

  static exportToCsv(data: ClientEntity) {
    const clientEntity = new ClientEntity(data);

    delete clientEntity.password;
    delete clientEntity.forgot_password_code;

    return {
      ...clientEntity,
      createdAt: format(clientEntity.createdAt, 'yyyy-MM-dd HH:mm:ss'),
      updatedAt: format(clientEntity.updatedAt, 'yyyy-MM-dd HH:mm:ss'),
    };
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

  @ApiProperty()
  seller_email: string;

  @ApiPropertyOptional({ type: () => SimplifiedUserEntity })
  seller?: UserEntity | null;

  @ApiProperty({ type: ClientInfoEntity })
  clientInfo?: Partial<ClientInfoEntity>;

  @ApiProperty({ type: [SimplifiedCompanyEntity] })
  companies?: SimplifiedCompanyEntity[] | null;

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

export class ClientEntityWithoutCompany extends OmitType(ClientEntity, [
  'companies',
]) {}

export class SimplifiedClientEntity implements Client {
  constructor(data?: Partial<SimplifiedClientEntity>) {
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

  @Exclude()
  seller_email: string;
}

export class GeneratePasswordEntity {
  constructor(data?: Partial<GeneratePasswordEntity>) {
    Object.assign(this, data);

    if (data.client) {
      this.client = new SimplifiedClientEntity(data.client);
    }
  }

  @ApiProperty()
  client: SimplifiedClientEntity;

  @ApiProperty()
  password_text: string;
}

export class SendGeneratedPasswordEntity {
  @ApiProperty({ example: 'Email sent successfully!' })
  message: string;
}
