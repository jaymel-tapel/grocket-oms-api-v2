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
        newClientsCount: (await this.getActiveClients()).length,
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
      newClientsCount: (await this.getActiveClients(range)).length,
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

    if (datesArray) {
      datesArray.shift();
    }

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
          if (date in paidReviewsObject) paidReviewsObject[date]++;
        } else {
          unpaidAmount += +order.unit_cost;

          review.createdAt.setUTCHours(0, 0, 0, 0);
          const date = review.createdAt.toISOString();
          if (date in unpaidReviewsObject) unpaidReviewsObject[date]++;
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

  async seller(range?: DateRangeDto) {
    if (Object.entries(range).length === 0) {
      return {
        newOrdersCount: (await this.getOrders()).length,
        newClientsCount: (await this.getActiveClients()).length,
        ...(await this.getCommission()),
        ordersOverview: await this.getOrderInfo(),
        clientsOverview: await this.clientDashboardInfo(),
      };
    }

    if (!(range.startRange && range.endRange)) {
      throw new BadRequestException(
        'startRange and endRange should both be filled',
      );
    }

    return {
      newOrdersCount: (await this.getOrders(range)).length,
      newClientsCount: (await this.getActiveClients(range)).length,
      ...(await this.getCommission(range)),
      ordersOverview: await this.getOrderInfo(range),
      clientsOverview: await this.clientDashboardInfo(range),
    };
  }

  private async getOrders(range?: DateRangeDto) {
    if (!range) {
      let endRange = new Date();
      let startRange = subDays(endRange, 30);

      range = { startRange, endRange };
    }

    range.startRange.setUTCHours(0, 0, 0, 0);
    range.endRange.setUTCHours(23, 59, 59, 999);

    return await this.database.order.findMany({
      where: {
        createdAt: { gte: range.startRange, lte: range.endRange },
      },
    });
  }

  async sellerGraph(range?: DateRangeDto) {
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
      where: {
        createdAt: { gte: range.startRange, lte: range.endRange },
        payment_status: PaymentStatusEnum.NEW,
      },
    });

    const datesArray = eachDayOfInterval({
      start: range.startRange,
      end: range.endRange,
    });

    if (datesArray) {
      datesArray.shift();
    }

    const newOrders: { [key: string]: number } = {};

    datesArray.forEach((date) => {
      date.setUTCHours(0, 0, 0, 0);
      newOrders[date.toISOString()] = 0;
    });

    orders.forEach((order) => {
      order.order_date.setUTCHours(0, 0, 0, 0);
      const date = order.order_date.toISOString();
      if (date in newOrders) newOrders[date]++;
    });

    const newOrdersStat = Object.keys(newOrders).map((date) => ({
      date: new Date(date),
      paidReviewsCount: newOrders[date],
    }));

    return { newOrdersStat };
  }

  private async getOrderPercentage(range?: DateRangeDto) {
    if (!range) {
      let endRange = new Date();
      let startRange = subDays(endRange, 30);

      range = { startRange, endRange };
    }

    range.startRange.setUTCHours(0, 0, 0, 0);
    range.endRange.setUTCHours(23, 59, 59, 999);

    const orders = await this.getOrders(range);

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

  private async getOrderInfo(range?: DateRangeDto) {
    if (!range) {
      let endRange = new Date();
      let startRange = subDays(endRange, 30);

      range = { startRange, endRange };
    }

    range.startRange.setUTCHours(0, 0, 0, 0);
    range.endRange.setUTCHours(23, 59, 59, 999);

    const orders = await this.database.order.findMany({
      where: { createdAt: { gte: range.startRange, lte: range.endRange } },
      include: { client: true, orderReviews: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const orderInfos = orders.map((order) => {
      const date = order.createdAt;
      const id = order.id;
      const client = order.client.name;
      const reviews = order.orderReviews.length;
      const payment_status = order.payment_status;
      const remarks = order.remarks;

      let total: number = 0;
      order.orderReviews.forEach((review) => {
        if (review.status === OrderReviewStatus.GELOSCHT) {
          total += +order.unit_cost;
        }
      });

      return { date, id, client, total, reviews, payment_status, remarks };
    });

    return orderInfos;
  }

  private async getCommission(range?: DateRangeDto) {
    if (!range) {
      let endRange = new Date();
      let startRange = subDays(endRange, 30);

      range = { startRange, endRange };
    }

    range.startRange.setUTCHours(0, 0, 0, 0);
    range.endRange.setUTCHours(23, 59, 59, 999);

    const orders = await this.database.order.findMany({
      where: { createdAt: { gte: range.startRange, lte: range.endRange } },
      include: { client: true, orderReviews: true },
    });

    let currentCommission: number = 0;
    let unpaidCommission: number = 0;
    orders.forEach((order) => {
      order.orderReviews.forEach((review) => {
        if (review.status === OrderReviewStatus.GELOSCHT) {
          currentCommission += +order.unit_cost;
        } else {
          unpaidCommission += +order.unit_cost;
        }
      });
    });

    return { currentCommission, unpaidCommission };
  }
}
