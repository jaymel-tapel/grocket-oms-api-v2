import { ApiProperty } from '@nestjs/swagger';

class BaseClientReport {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  count: number;
}

export class ClientReportEntity {
  constructor(data: Partial<ClientReportEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty()
  total_clients: number;

  @ApiProperty()
  new_clients: number;

  @ApiProperty()
  clientsLoggedIn: number;

  @ApiProperty({ type: [BaseClientReport] })
  newClientsResult: BaseClientReport[];

  @ApiProperty({ type: [BaseClientReport] })
  inactiveClientsResult: BaseClientReport[];
}
