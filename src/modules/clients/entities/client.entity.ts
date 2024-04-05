import { UserEntity } from '@modules/users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Client } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { ClientInfoEntity } from './client-info.entity';

export class ClientEntity implements Client {
  constructor({ seller, clientInfo, ...data }: Partial<ClientEntity>) {
    Object.assign(this, data);

    if (seller) {
      this.seller = new UserEntity(seller);
    }

    if (clientInfo) {
      this.clientInfo = new ClientInfoEntity(clientInfo);
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

  @ApiPropertyOptional({ type: UserEntity })
  seller?: UserEntity | null;

  @ApiProperty({ type: ClientInfoEntity })
  clientInfo?: ClientInfoEntity;
}

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
