import { DatabaseService } from '@modules/database/services/database.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ChartDto } from '../dto/chart.dto';
import { getWeek, sub } from 'date-fns';
import { SellerCountDto } from '../dto/seller-count.dto';

@Injectable()
export class SellersService {
  constructor(private readonly database: DatabaseService) {}

  async getSellerCount(data?: SellerCountDto) {
    if (Object.entries(data).length === 0) {
      // default to now and the past 30 days
      const today = new Date();
      var priorDate = sub(today, { days: 30 });

      const count = await this.sellerCount(priorDate, today);
      return count;
    }

    if (!(data.startRange && data.endRange)) {
      return new BadRequestException(
        'startRange and endRange should both be filled',
      );
    }

    const count = await this.sellerCount(data.startRange, data.endRange);
    return count;
  }

  async getChartDetail(data: ChartDto) {
    const startDate = data.startRange;
    const endDate = data.endRange;

    data.startRange.setUTCHours(0, 0, 0, 0);
    data.endRange.setUTCHours(0, 0, 0, 0);

    const inactiveSeller = data.getInactive;

    // Start and end range cannot be the same
    // No result will be found
    const result = await this.database.user.findMany({
      where: {
        role: 'SELLER',
        ...(!inactiveSeller && {
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
          status: 'ACTIVE',
        }),
        ...(inactiveSeller && {
          deletedAt: { gte: new Date(startDate), lte: new Date(endDate) },
          status: 'DELETED',
        }),
      },
    });

    const sellersByDate = {};
    result.forEach((seller) => {
      inactiveSeller
        ? seller.deletedAt.setUTCHours(0, 0, 0, 0)
        : seller.createdAt.setUTCHours(0, 0, 0, 0);

      // Sort by day
      if (data.interval === 'day') {
        let date = inactiveSeller
          ? seller.deletedAt.toISOString()
          : seller.createdAt.toISOString();
        sellersByDate[date] = (sellersByDate[date] || 0) + 1;
      }

      // Sort by week
      else if (data.interval === 'week') {
        const date = inactiveSeller
          ? `${getWeek(seller.deletedAt)} (${seller.deletedAt.getFullYear()})`
          : `${getWeek(seller.createdAt)} (${seller.createdAt.getFullYear()})`;
        sellersByDate[date] = (sellersByDate[date] || 0) + 1;
      }

      // Sort by month
      else if (data.interval === 'month') {
        inactiveSeller
          ? seller.deletedAt.setDate(1)
          : seller.createdAt.setDate(1);

        const week = inactiveSeller
          ? seller.deletedAt.toISOString()
          : seller.createdAt.toISOString();
        sellersByDate[week] = (sellersByDate[week] || 0) + 1;
      }
    });

    const sellerCount = Object.keys(sellersByDate).map((date) => ({
      date,
      sellerCount: sellersByDate[date],
    }));

    return { sellerCount };
  }

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
}
