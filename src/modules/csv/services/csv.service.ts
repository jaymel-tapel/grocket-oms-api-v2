import { Injectable } from '@nestjs/common';
import * as fastcsv from 'fast-csv';
import { ClientsService } from '../../clients/services/clients.service';
import { Response } from 'express';
import { ClientEntity } from '@modules/clients/entities/client.entity';

@Injectable()
export class CsvService {
  constructor(private readonly clientsService: ClientsService) {}

  async exportClients(res: Response) {
    const data = await this.clientsService.findAllByCondition({});

    const formattedData = data.map((d) => ClientEntity.exportToCsv(d));

    fastcsv.write(formattedData, { headers: true }).pipe(res);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
  }
}
