import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import { ChartDto } from '../dto/chart.dto';

@Injectable()
export class SellersService {
  constructor(private readonly database: DatabaseService) {}

  async getSellerCount() {
    const count = await this.sellerCount();
    return count;
  }

  // Store last weeks number?
  async getVolatility() {
    const count = await this.sellerCount();

    // Change digits to last weeks count
    // Via database?
    const sellerDifference = count.allSellers - 4;
    const activeSellerDifference = count.activeSellers - 4;
    const inactiveSellerDifference = count.inactiveSellers - 1;

    const sellerVolatility = (sellerDifference / count.allSellers) * 100;
    const activeSellerVolatility =
      (activeSellerDifference / count.activeSellers) * 100;
    const inactiveSellerVolatility =
      (inactiveSellerDifference / count.inactiveSellers) * 100;

    return {
      sellerVolatility,
      activeSellerVolatility,
      inactiveSellerVolatility,
    };
  }

  async getChartDetail(data: ChartDto) {
    const [startDate] = data.startRange.toISOString().split('T');
    const [endDate] = data.endRange.toISOString().split('T');

    const inactiveSeller = data.getInactive;

    // Start and end range cannot be the same
    // No result will be found
    const result = await this.database.user.findMany({
      where: {
        role: 'SELLER',
        ...(!inactiveSeller && {
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
          deletedAt: null,
        }),
        ...(inactiveSeller && {
          deletedAt: { gte: new Date(startDate), lte: new Date(endDate) },
        }),
      },
    });

    const sellersByDate = {};
    result.forEach((seller) => {
      // Sort by day
      if (data.interval === 'day') {
        const [date] = inactiveSeller
          ? seller.deletedAt.toISOString().split('T')
          : seller.createdAt.toISOString().split('T');
        sellersByDate[date] = (sellersByDate[date] || 0) + 1;
      }

      // Sort by week
      else if (data.interval === 'week') {
        if (inactiveSeller) {
          const date = `Week ${this.getWeekNumber(seller.deletedAt)[1]} (${
            this.getWeekNumber(seller.deletedAt)[0]
          })`;
          sellersByDate[date] = (sellersByDate[date] || 0) + 1;
        } else {
          const date = `Week ${this.getWeekNumber(seller.createdAt)[1]} (${
            this.getWeekNumber(seller.createdAt)[0]
          })`;
          sellersByDate[date] = (sellersByDate[date] || 0) + 1;
        }
      }

      // Sort by month
      else if (data.interval === 'month') {
        const month = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];

        if (inactiveSeller) {
          const date =
            month[seller.deletedAt.getMonth()] +
            ' ' +
            seller.deletedAt.getFullYear().toString();
          sellersByDate[date] = (sellersByDate[date] || 0) + 1;
        } else {
          const date =
            month[seller.createdAt.getMonth()] +
            ' ' +
            seller.createdAt.getFullYear().toString();
          sellersByDate[date] = (sellersByDate[date] || 0) + 1;
        }
      }
    });

    // If it is recommended to make the date a value instead of a key
    const sellerCount = Object.keys(sellersByDate).map((date) => ({
      date,
      sellerCount: sellersByDate[date],
    }));

    return { sellerCount };
  }

  private async allSellers() {
    return await this.database.user.findMany({ where: { role: 'SELLER' } });
  }

  private async activeSellers() {
    return await this.database.user.findMany({
      where: { role: 'SELLER', deletedAt: null },
    });
  }

  private async inactiveSellers() {
    return await this.database.user.findMany({
      where: { role: 'SELLER', deletedAt: { not: null } },
    });
  }

  private async sellerCount() {
    const allSellers = (await this.allSellers()).length;
    const activeSellers = (await this.activeSellers()).length;
    const inactiveSellers = (await this.inactiveSellers()).length;

    return {
      allSellers,
      activeSellers,
      inactiveSellers,
    };
  }

  // Stolen
  private getWeekNumber(sellerDate) {
    sellerDate = new Date(
      Date.UTC(
        sellerDate.getFullYear(),
        sellerDate.getMonth(),
        sellerDate.getDate(),
      ),
    );
    sellerDate.setUTCDate(
      sellerDate.getUTCDate() + 4 - (sellerDate.getUTCDay() || 7),
    );
    var yearStart = Date.UTC(sellerDate.getUTCFullYear(), 0, 1);
    var weekNo = Math.ceil(((sellerDate - yearStart) / 86400000 + 1) / 7);
    return [sellerDate.getUTCFullYear(), weekNo];
  }
}
