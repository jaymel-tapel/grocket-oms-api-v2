import { DatabaseService } from '@modules/database/services/database.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DateRangeDto } from '../dto/date-range.dto';
import { eachDayOfInterval, subDays } from 'date-fns';
import { OrderReviewStatus, PaymentStatusEnum } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly database: DatabaseService) {}

  async admin(range?: DateRangeDto) {
    if (Object.entries(range).length === 0) {
      return {
        ordersOverview: await this.getOrderPercentage(),
        newclientCount: (await this.getActiveClients()).length,
        revenue: await this.getRevenue(),
        clientsOverview: await this.clientDashboardInfo(),
      };
    }

    if (!(range.startRange && range.endRange)) {
      throw new BadRequestException(
        'startRange and endRange should both be filled',
      );
    }

    return {
      ordersOverview: await this.getOrderPercentage(range),
      newclientCount: (await this.getActiveClients(range)).length,
      revenue: await this.getRevenue(range),
      clientsOverview: await this.clientDashboardInfo(range),
    };
  }

  async adminGraph(range?: DateRangeDto) {
    if (Object.entries(range).length === 0) {
      let endRange = new Date();
      let startRange = subDays(endRange, 30);

      range = { startRange, endRange };
    }

    if (!(range.startRange && range.endRange)) {
      throw new BadRequestException(
        'startRange and endRange should both be filled',
      );
    }

    range.startRange.setUTCHours(0, 0, 0, 0);
    range.endRange.setUTCHours(23, 59, 59, 999);

    const orders = await this.database.order.findMany({
      where: { createdAt: { gte: range.startRange, lte: range.endRange } },
      include: { orderReviews: true },
    });

    const datesArray = eachDayOfInterval({
      start: range.startRange,
      end: range.endRange,
    });
    const paidReviewsObject: { [key: string]: number } = {};

    datesArray.forEach((date) => {
      date.setUTCHours(0, 0, 0, 0);
      paidReviewsObject[date.toISOString()] = 0;
    });

    const unpaidReviewsObject = { ...paidReviewsObject };

    let receivedAmount: number = 0;
    let unpaidAmount: number = 0;
    orders.forEach((order) => {
      order.orderReviews.forEach((review) => {
        if (review.status === OrderReviewStatus.GELOSCHT) {
          receivedAmount += +order.unit_cost;

          review.createdAt.setUTCHours(0, 0, 0, 0);
          const date = review.createdAt.toISOString();
          paidReviewsObject[date]++;
        } else {
          unpaidAmount += +order.unit_cost;

          review.createdAt.setUTCHours(0, 0, 0, 0);
          const date = review.createdAt.toISOString();
          unpaidReviewsObject[date]++;
        }
      });
    });

    const paidReviews = Object.keys(paidReviewsObject).map((date) => ({
      date: new Date(date),
      paidReviewsCount: paidReviewsObject[date],
    }));

    const unpaidReviews = Object.keys(unpaidReviewsObject).map((date) => ({
      date: new Date(date),
      unpaidReviewsCount: unpaidReviewsObject[date],
    }));

    return { receivedAmount, unpaidAmount, paidReviews, unpaidReviews };
  }

  private async getOrders(startRange: Date, endRange: Date) {
    return await this.database.order.findMany({
      where: {
        createdAt: { gte: startRange, lte: endRange },
      },
    });
  }

  private async getOrderPercentage(range?: DateRangeDto) {
    if (!range) {
      let endRange = new Date();
      let startRange = subDays(endRange, 30);

      range = { startRange, endRange };
    }

    range.startRange.setUTCHours(0, 0, 0, 0);
    range.endRange.setUTCHours(23, 59, 59, 999);

    const orders = await this.getOrders(range.startRange, range.endRange);

    const newOrders = orders.filter(
      (order) => order.payment_status === PaymentStatusEnum.NEW,
    );
    const paidOrders = orders.filter(
      (order) => order.payment_status === PaymentStatusEnum.PAID,
    );
    const invoiceOrders = orders.filter(
      (order) => order.payment_status === PaymentStatusEnum.SENT_INVOICE,
    );
    const pr1 = orders.filter(
      (order) => order.payment_status === PaymentStatusEnum.PR1,
    );
    const pr2 = orders.filter(
      (order) => order.payment_status === PaymentStatusEnum.PR2,
    );

    const totalOrderCount = orders.length;
    const newOrdersCount = newOrders.length;
    const paidOrdersCount = paidOrders.length;
    const invoiceOrdersCount = invoiceOrders.length;
    const pr1Count = pr1.length;
    const pr2Count = pr2.length;

    const newOrdersPercent = (newOrdersCount * 100) / totalOrderCount;
    const paidOrdersPercent = (paidOrdersCount * 100) / totalOrderCount;
    const invoiceOrdersPercent = (invoiceOrdersCount * 100) / totalOrderCount;
    const pr1Percent = (pr1Count * 100) / totalOrderCount;
    const pr2Percent = (pr2Count * 100) / totalOrderCount;

    return {
      totalOrderCount,
      newOrdersCount,
      paidOrdersCount,
      invoiceOrdersCount,
      pr1Count,
      pr2Count,
      newOrdersPercent,
      paidOrdersPercent,
      invoiceOrdersPercent,
      pr1Percent,
      pr2Percent,
    };
  }

  private async getActiveClients(range?: DateRangeDto, getAll?: boolean) {
    if (!range) {
      let endRange = new Date();
      let startRange = subDays(endRange, 30);

      range = { startRange, endRange };
    }

    range.startRange.setUTCHours(0, 0, 0, 0);
    range.endRange.setUTCHours(23, 59, 59, 999);

    return await this.database.client.findMany({
      where: {
        ...(!getAll && {
          createdAt: { gte: range.startRange, lte: range.endRange },
        }),
        deletedAt: null,
      },
      include: {
        clientInfo: { include: { industry: true } },
        orders: { orderBy: { createdAt: 'desc' } },
      },
      ...(!getAll && { take: 5 }),
    });
  }

  private async clientDashboardInfo(range?: DateRangeDto) {
    const clients = await this.getActiveClients(range);

    const clientInfo = clients.map((client) => {
      const name = client.name;
      const email = client.email;
      const industry = client.clientInfo.industry?.name ?? null;
      const order = client.orders.length;
      let amount = 0;
      client.orders.forEach((order) => {
        amount += +order.total_price;
      });
      const date = client.createdAt;

      return { name, email, industry, order, amount, date };
    });

    return clientInfo;
  }

  private async getRevenue(range?: DateRangeDto) {
    if (!range) {
      let endRange = new Date();
      let startRange = subDays(endRange, 30);

      range = { startRange, endRange };
    }

    range.startRange.setUTCHours(0, 0, 0, 0);
    range.endRange.setUTCHours(23, 59, 59, 999);

    const orders = await this.database.order.findMany({
      where: { createdAt: { gte: range.startRange, lte: range.endRange } },
      include: { orderReviews: true },
    });

    let revenue: number = 0;
    orders.forEach((order) => {
      order.orderReviews.forEach((review) => {
        if (review.status === OrderReviewStatus.GELOSCHT) {
          revenue += +order.unit_cost;
        }
      });
    });

    return revenue;
  }
}
