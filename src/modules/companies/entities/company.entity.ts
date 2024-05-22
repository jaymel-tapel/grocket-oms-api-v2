import { ClientEntity, ClientEntityWithoutCompany } from '@modules/clients/entities/client.entity';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Company } from '@prisma/client';

export class CompanyEntity implements Company {
  constructor({ client, ...partial }: Partial<CompanyEntity>) {
    Object.assign(this, partial);

    if (client) {
      this.client = new ClientEntity(client);
    }
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  clientId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  invalid_check_count: number;

  @ApiProperty({ default: false })
  valid_url: boolean;

  @ApiProperty({ default: false })
  check_url: boolean;

  @ApiProperty({ default: false })
  latest_check: boolean;

  @ApiPropertyOptional({ type: () => ClientEntityWithoutCompany })
  client?: ClientEntityWithoutCompany;
}

export class SimplifiedCompanyEntity extends OmitType(CompanyEntity, ['client'] as const) {}
