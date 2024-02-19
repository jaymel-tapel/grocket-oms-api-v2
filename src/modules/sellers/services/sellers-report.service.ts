import { DatabaseService } from '@modules/database/services/database.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { addDays, eachDayOfInterval, isAfter, subDays } from 'date-fns';
import { DateRangeDto } from '../dto/date-range.dto';

@Injectable()
export class SellersReportService {
  constructor(private readonly database: DatabaseService) {}

  async getSellerCount(data?: DateRangeDto) {
    if (Object.entries(data).length === 0) {
      // default to now and the past 30 days
      const count = await this.sellerCount();
      return count;
    }

    if (!(data.startRange && data.endRange)) {
      throw new BadRequestException(
        'startRange and endRange should both be filled',
      );
    }

    const count = await this.sellerCount(data.startRange, data.endRange);
    return count;
  }

  // get startRange and endRange
  // default is now and the past 30 days
  // give number of active/inactive accounts by the day
  async getChartDetail(data?: DateRangeDto) {
    if (Object.entries(data).length === 0) {
      // default to now and the past 30 days
      const today = new Date();
      const priorDate = subDays(today, 30);

      return await this.chartList(priorDate, today);
    }

    if (!(data.startRange && data.endRange)) {
      throw new BadRequestException(
        'startRange and endRange should both be filled',
      );
    }

    return await this.chartList(data.startRange, data.endRange);
  }

  // async getChartDetail(data: ChartDto) {
  //   const startDate = data.startRange;
  //   const endDate = data.endRange;

  //   data.startRange.setUTCHours(0, 0, 0, 0);
  //   data.endRange.setUTCHours(23, 59, 59, 999);

  //   const inactiveSeller = data.getInactive;

  //   // Start and end range cannot be the same
  //   // No result will be found
  //   const result = await this.database.user.findMany({
  //     where: {
  //       role: 'SELLER',
  //       ...(!inactiveSeller && {
  //         createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
  //         status: 'ACTIVE',
  //       }),
  //       ...(inactiveSeller && {
  //         deletedAt: { gte: new Date(startDate), lte: new Date(endDate) },
  //         status: 'DELETED',
  //       }),
  //     },
  //   });

  //   const sellersByDate = {};
  //   result.forEach((seller) => {
  //     inactiveSeller
  //       ? seller.deletedAt.setUTCHours(0, 0, 0, 0)
  //       : seller.createdAt.setUTCHours(0, 0, 0, 0);

  //     // Sort by day
  //     if (data.interval === 'day') {
  //       let date = inactiveSeller
  //         ? seller.deletedAt.toISOString()
  //         : seller.createdAt.toISOString();
  //       sellersByDate[date] = (sellersByDate[date] || 0) + 1;
  //     }

  //     // Sort by week
  //     else if (data.interval === 'week') {
  //       const date = inactiveSeller
  //         ? `${getWeek(seller.deletedAt)} (${seller.deletedAt.getFullYear()})`
  //         : `${getWeek(seller.createdAt)} (${seller.createdAt.getFullYear()})`;
  //       sellersByDate[date] = (sellersByDate[date] || 0) + 1;
  //     }

  //     // Sort by month
  //     else if (data.interval === 'month') {
  //       inactiveSeller
  //         ? seller.deletedAt.setDate(1)
  //         : seller.createdAt.setDate(1);

  //       const week = inactiveSeller
  //         ? seller.deletedAt.toISOString()
  //         : seller.createdAt.toISOString();
  //       sellersByDate[week] = (sellersByDate[week] || 0) + 1;
  //     }
  //   });

  //   const sellerCount = Object.keys(sellersByDate).map((date) => ({
  //     date,
  //     sellerCount: sellersByDate[date],
  //   }));

  //   return { sellerCount };
  // }

  private async allSellers(startRange?: Date, endRange?: Date) {
    return await this.database.user.findMany({
      where: {
        role: 'SELLER',
        ...(startRange &&
          endRange && { createdAt: { gte: startRange, lte: endRange } }),
      },
    });
  }

  private async activeSellers(startRange?: Date, endRange?: Date) {
    return await this.database.user.findMany({
      where: {
        role: 'SELLER',
        ...(startRange &&
          endRange && { createdAt: { gte: startRange, lte: endRange } }),
        status: 'ACTIVE',
      },
    });
  }

  private async inactiveSellers(startRange?: Date, endRange?: Date) {
    return await this.database.user.findMany({
      where: {
        role: 'SELLER',
        ...(startRange &&
          endRange && { deletedAt: { gte: startRange, lte: endRange } }),
        status: 'DELETED',
      },
    });
  }

  private async sellerCount(startRange?: Date, endRange?: Date) {
    if (!(startRange && endRange)) {
      endRange = new Date();
      startRange = subDays(endRange, 30);
    }

    endRange.setUTCHours(23, 59, 59, 999);
    startRange.setUTCHours(0, 0, 0, 0);

    const allSellers = (await this.allSellers(startRange, endRange)).length;
    const activeSellers = (await this.activeSellers(startRange, endRange))
      .length;
    const inactiveSellers = (await this.inactiveSellers(startRange, endRange))
      .length;

    return {
      allSellers,
      activeSellers,
      inactiveSellers,
    };
  }

  private async chartList(startRange?: Date, endRange?: Date) {
    if (!(startRange && endRange)) {
      startRange = new Date();
      endRange = subDays(startRange, 30);
    }

    endRange.setUTCHours(23, 59, 59, 999);
    startRange.setUTCHours(0, 0, 0, 0);

    // Get the list of sellers active/inactive
    const activeSellers = await this.activeSellers(startRange, endRange);
    const inactiveSellers = await this.inactiveSellers(startRange, endRange);

    // Creates an array of dates from the startRange until to the endRange
    const datesArray = eachDayOfInterval({ start: startRange, end: endRange });
    const activeSellersObject: { [key: string]: number } = {};

    datesArray.forEach((date) => {
      date.setUTCHours(0, 0, 0, 0);
      activeSellersObject[date.toISOString()] = 0;
    });

    const inactiveSellerObject = { ...activeSellersObject };

    // Increments the count if the date are the same as the key
    activeSellers.forEach((seller) => {
      seller.createdAt.setUTCHours(0, 0, 0, 0);

      const date = seller.createdAt.toISOString();
      activeSellersObject[date]++;
    });

    inactiveSellers.forEach((seller) => {
      seller.deletedAt.setUTCHours(0, 0, 0, 0);

      const date = seller.deletedAt.toISOString();
      inactiveSellerObject[date]++;
    });

    // Initiallizing a new object with an array of dates and seller count
    const activeSellerCount = Object.keys(activeSellersObject).map((date) => ({
      date: new Date(date),
      activeSellerCount: activeSellersObject[date],
    }));

    const inactiveSellerCount = Object.keys(inactiveSellerObject).map(
      (date) => ({
        date: new Date(date),
        inactiveSellerCount: inactiveSellerObject[date],
      }),
    );

    return { activeSellerCount, inactiveSellerCount };
  }
}
