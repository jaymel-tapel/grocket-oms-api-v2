import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import { addDays, subDays } from 'date-fns';
import { SellerReportDto } from '../dto/seller-report.dto';
import { StatusEnum } from '@prisma/client';

@Injectable()
export class SellersReportService {
  constructor(private readonly database: DatabaseService) {}

  async getSellerCount(data?: SellerReportDto) {
    let { startRange, endRange, code } = data;

    if (!(startRange && endRange)) {
      endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);
    } else {
      endRange = new Date(endRange.setUTCHours(23, 59, 59, 999));
      startRange = new Date(startRange.setUTCHours(0, 0, 0, 0));
    }

    const allSellers = (await this.allSellers(code, startRange, endRange))
      .length;
    const activeSellers = (await this.activeSellers(code, startRange, endRange))
      .length;
    const inactiveSellers = (
      await this.inactiveSellers(code, startRange, endRange)
    ).length;

    return {
      allSellers,
      activeSellers,
      inactiveSellers,
    };
  }

  // get startRange and endRange
  // default is now and the past 30 days
  // give number of active/inactive accounts by the day
  async getChartDetail(data?: SellerReportDto) {
    let { startRange, endRange, code } = data;

    if (!startRange || !endRange) {
      endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);
    }

    endRange = new Date(endRange.setUTCHours(23, 59, 59, 999));
    startRange = new Date(startRange.setUTCHours(0, 0, 0, 0));

    // Get the list of sellers active/inactive
    const activeSellers = await this.activeSellers(code, startRange, endRange);
    const inactiveSellers = await this.inactiveSellers(
      code,
      startRange,
      endRange,
    );

    // Creates an array of dates from the startRange until to the endRange
    const datesArray: Date[] = [];
    let tempStartDate: Date = startRange;

    while (tempStartDate <= endRange) {
      datesArray.push(tempStartDate);
      tempStartDate = addDays(tempStartDate, 1);
    }

    const activeSellersObject: { [key: string]: number } = {};
    const inactiveSellersObject: { [key: string]: number } = {};

    datesArray.forEach((date) => {
      activeSellersObject[date.toISOString()] = 0;
      inactiveSellersObject[date.toISOString()] = 0;
    });

    // Increments the count if the date are the same as the key
    activeSellers.forEach((seller) => {
      seller.createdAt.setUTCHours(0, 0, 0, 0);

      const date = seller.createdAt.toISOString();
      if (date in activeSellersObject) {
        activeSellersObject[date]++;
      }
    });

    inactiveSellers.forEach((seller) => {
      seller.deletedAt?.setUTCHours(0, 0, 0, 0);

      const date = seller.deletedAt?.toISOString();
      if (date in inactiveSellersObject) {
        inactiveSellersObject[date]++;
      }
    });

    // Initiallizing a new object with an array of dates and seller count
    const activeSellerCount = Object.keys(activeSellersObject).map((date) => ({
      date: new Date(date),
      activeSellerCount: activeSellersObject[date],
    }));

    const inactiveSellerCount = Object.keys(inactiveSellersObject).map(
      (date) => ({
        date: new Date(date),
        inactiveSellerCount: inactiveSellersObject[date],
      }),
    );

    return { activeSellerCount, inactiveSellerCount };
  }

  private async allSellers(code: string, startRange?: Date, endRange?: Date) {
    return await this.database.client.findMany({
      include: { clientInfo: { include: { brand: true } }, seller: true },
      where: {
        createdAt: { gte: startRange, lte: endRange },
        clientInfo: { brand: { code: code } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async activeSellers(
    code: string,
    startRange?: Date,
    endRange?: Date,
  ) {
    return await this.database.client.findMany({
      include: { clientInfo: { include: { brand: true } }, seller: true },
      where: {
        createdAt: { gte: startRange, lte: endRange },
        clientInfo: { brand: { code: code } },
        seller: { status: StatusEnum.ACTIVE },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async inactiveSellers(
    code: string,
    startRange?: Date,
    endRange?: Date,
  ) {
    return await this.database.client.findMany({
      include: { clientInfo: { include: { brand: true } }, seller: true },
      where: {
        createdAt: { gte: startRange, lte: endRange },
        clientInfo: { brand: { code: code } },
        seller: { status: StatusEnum.DELETED },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
