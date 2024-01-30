import { IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { ClientDto, ClientInfoDto } from './create-client.dto';

export class PartialClientDto extends PartialType(
  OmitType(ClientDto, ['password']),
) {}
export class PartialClientInfoDto extends PartialType(ClientInfoDto) {}

export class UpdateClientDto extends IntersectionType(
  PartialClientDto,
  PartialClientInfoDto,
) {
  default_unit_cost?: number;
}
