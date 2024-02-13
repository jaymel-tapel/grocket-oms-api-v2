import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import { ClientReportDateRangeDto } from '../dto/get-client-report.dto';
import { Prisma } from '@prisma/client';
import { addDays, eachDayOfInterval, subDays } from 'date-fns';
import { dateRange } from '@src/common/helpers/date-range';
import { IClientReport } from '../interfaces/client-report.interface';
import { merge } from 'lodash';

@Injectable()
export class ClientReportsService {
  constructor(private readonly database: DatabaseService) {}

  // * Get Client Report
  async report(dateRangeDto: ClientReportDateRangeDto) {
    const baseReport = await this.baseReport(dateRangeDto);

    const total_clients = await this.database.client.count({
      where: {
        ...baseReport.clientQuery.where,
      },
    });

    const clients_logged_in = await this.database.clientInfo.count({
      where: { hasLoggedIn: true, brand: { code: dateRangeDto.code } },
    });

    const currentDate = new Date();
    const twentyFourHoursAgo = subDays(currentDate, 1);

    const new_clients = (
      await this.findAllClientsByRange({
        startRange: twentyFourHoursAgo,
        endRange: currentDate,
        clientQuery: baseReport.clientQuery,
      })
    ).length;

    const foundClientsByRange = await this.findAllClientsByRange(baseReport);
    const foundInactiveClients = await this.findAllClientsByRange(
      {
        ...baseReport,
        clientQuery: {
          ...baseReport.clientQuery,
          where: merge(baseReport.clientQuery.where, {
            clientInfo: {
              status: 'DELETED',
            },
          }),
        },
      },
      true,
    );

    const datesArray = eachDayOfInterval({
      start: baseReport.startRange,
      end: baseReport.endRange,
    });

    const newClientsObj: { [key: string]: number } = {};
    const inactiveClientsObj = { ...newClientsObj };

    datesArray.forEach((date) => {
      date = addDays(date.setUTCHours(0, 0, 0, 0), 1);
      newClientsObj[date.toISOString()] = 0;
      inactiveClientsObj[date.toISOString()] = 0;
    });

    for (const client of foundClientsByRange) {
      client.createdAt.setUTCHours(0, 0, 0, 0);
      const date = client.createdAt.toISOString();
      newClientsObj[date]++;
    }

    for (const inactiveClient of foundInactiveClients) {
      inactiveClient.createdAt.setUTCHours(0, 0, 0, 0);
      const date = inactiveClient.createdAt.toISOString();
      inactiveClientsObj[date]++;
    }

    const newClientsResult = Object.keys(newClientsObj).map((date) => ({
      date: new Date(date),
      count: newClientsObj[date],
    }));

    const inactiveClientsResult = Object.keys(inactiveClientsObj).map(
      (date) => ({
        date: new Date(date),
        count: inactiveClientsObj[date],
      }),
    );

    return {
      total_clients,
      new_clients,
      clients_logged_in,
      newClientsResult,
      inactiveClientsResult,
    };
  }

  private async findAllClientsByRange(
    { startRange, endRange, clientQuery }: IClientReport,
    includeDelete?: boolean,
  ) {
    let database = includeDelete
      ? this.database
      : await this.database.softDelete();

    return await database.client.findMany({
      where: {
        ...clientQuery.where,
        createdAt: {
          gte: startRange,
          lte: endRange,
        },
      },
      include: {
        clientInfo: true,
      },
    });
  }

  private async baseReport(dateRangeDto: ClientReportDateRangeDto) {
    let { startRange, endRange, sellerId, code } = dateRangeDto;
    let clientQuery: Prisma.ClientFindManyArgs = {
      where: {
        clientInfo: { brand: { code } },
      },
    };

    // ? Last 30 Days
    if (!startRange && !endRange) {
      startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);
      endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
    } else {
      const dateRangeHelper = await dateRange(
        { from: startRange, to: endRange },
        this.database,
        'client',
      );
      startRange = dateRangeHelper.startDate;
      endRange = dateRangeHelper.endDate;
    }

    if (sellerId) {
      clientQuery = {
        where: { ...clientQuery.where, sellerId },
      };
    }

    return { startRange, endRange, clientQuery };
  }
}
