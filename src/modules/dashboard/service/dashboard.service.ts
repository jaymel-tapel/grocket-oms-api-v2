import { DatabaseService } from '@modules/database/services/database.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DashboardDateRangeDto } from '../dto/date-range.dto';
import { addDays, eachDayOfInterval, subDays } from 'date-fns';
import {
  OrderReviewStatus,
  PaymentStatusEnum,
  Prisma,
  RoleEnum,
} from '@prisma/client';
import { UserEntity } from '@modules/users/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly database: DatabaseService) {}

  async admin(range?: DashboardDateRangeDto) {
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

  async adminGraph(range?: DashboardDateRangeDto) {
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

    range.startRange = new Date(range.startRange.setUTCHours(0, 0, 0, 0));
    range.endRange = new Date(range.endRange.setUTCHours(23, 59, 59, 999));

    const orders = await this.database.order.findMany({
      where: { createdAt: { gte: range.startRange, lte: range.endRange } },
      include: { orderReviews: true },
    });

    const datesArray: Date[] = [];
    let tempStartDate: Date = range.startRange;

    while (tempStartDate <= range.endRange) {
      datesArray.push(tempStartDate);
      tempStartDate = addDays(tempStartDate, 1);
    }

    const paidReviewsObject: { [key: string]: number } = {};
    const unpaidReviewsObject = { ...paidReviewsObject };

    datesArray.forEach((date) => {
      paidReviewsObject[date.toISOString()] = 0;
      unpaidReviewsObject[date.toISOString()] = 0;
    });

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

  async seller(authUser: UserEntity, range?: DashboardDateRangeDto) {
    if (Object.entries(range).length === 0) {
      return {
        newOrdersCount: (await this.getOrders(null, authUser)).length,
        newClientsCount: (await this.getActiveClients(null, authUser)).length,
        ...(await this.getCommission(null, authUser)),
        ordersOverview: await this.getOrderInfo(null, authUser),
        clientsOverview: await this.clientDashboardInfo(null, authUser),
      };
    }

    if (!(range.startRange && range.endRange)) {
      throw new BadRequestException(
        'startRange and endRange should both be filled',
      );
    }

    return {
      newOrdersCount: (await this.getOrders(range, authUser)).length,
      newClientsCount: (await this.getActiveClients(range, authUser)).length,
      ...(await this.getCommission(range, authUser)),
      ordersOverview: await this.getOrderInfo(null, authUser),
      clientsOverview: await this.clientDashboardInfo(null, authUser),
    };
  }

  private async getOrders(range?: DashboardDateRangeDto, seller?: UserEntity) {
    if (!range) {
      let endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      let startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);

      range = { startRange, endRange };
    }

    range.endRange = new Date(range.endRange.setUTCHours(23, 59, 59, 999));
    range.startRange = new Date(range.startRange.setUTCHours(0, 0, 0, 0));

    return await this.database.order.findMany({
      where: {
        createdAt: { gte: range.startRange, lte: range.endRange },
        ...(seller &&
          seller.role === RoleEnum.SELLER && { sellerId: seller.id }),
      },
    });
  }

  async sellerGraph(authUser: UserEntity, range?: DashboardDateRangeDto) {
    if (Object.entries(range).length === 0) {
      let endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      let startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);

      range = { startRange, endRange };
    }

    if (!(range.startRange && range.endRange)) {
      throw new BadRequestException(
        'startRange and endRange should both be filled',
      );
    }

    range.endRange = new Date(range.endRange.setUTCHours(23, 59, 59, 999));
    range.startRange = new Date(range.startRange.setUTCHours(0, 0, 0, 0));

    const orders = await this.database.order.findMany({
      where: {
        createdAt: { gte: range.startRange, lte: range.endRange },
        payment_status: PaymentStatusEnum.NEW,
        sellerId: authUser.id,
      },
    });

    const datesArray: Date[] = [];
    let tempStartDate: Date = range.startRange;

    while (tempStartDate <= range.endRange) {
      datesArray.push(tempStartDate);
      tempStartDate = addDays(tempStartDate, 1);
    }

    const newOrders: { [key: string]: number } = {};

    datesArray.forEach((date) => {
      newOrders[date.toISOString()] = 0;
    });

    orders.forEach((order) => {
      order.order_date?.setUTCHours(0, 0, 0, 0);
      const date = order.order_date?.toISOString();
      if (date in newOrders) newOrders[date]++;
    });

    const newOrdersStat = Object.keys(newOrders).map((date) => ({
      date: new Date(date),
      paidReviewsCount: newOrders[date],
    }));

    return { newOrdersStat };
  }

  private async getOrderPercentage(range?: DashboardDateRangeDto) {
    if (!range) {
      let endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      let startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);

      range = { startRange, endRange };
    }

    range.endRange = new Date(range.endRange.setUTCHours(23, 59, 59, 999));
    range.startRange = new Date(range.startRange.setUTCHours(0, 0, 0, 0));

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

  private async getActiveClients(
    range?: DashboardDateRangeDto,
    seller?: UserEntity,
    getAll?: boolean,
    limit?: boolean,
  ) {
    if (!range) {
      let endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      let startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);

      range = { startRange, endRange };
    }

    range.endRange = new Date(range.endRange.setUTCHours(23, 59, 59, 999));
    range.startRange = new Date(range.startRange.setUTCHours(0, 0, 0, 0));

    const whereClause: Prisma.ClientWhereInput = {
      deletedAt: null,
    };

    if (!getAll) {
      whereClause.createdAt = {
        gte: range.startRange,
        lte: range.endRange,
      };
    }

    if (seller && seller.role === RoleEnum.SELLER) {
      whereClause.sellerId = seller.id;
    }

    return await this.database.client.findMany({
      where: whereClause,
      include: {
        clientInfo: { include: { industry: true } },
        orders: { orderBy: { createdAt: 'desc' } },
      },
      ...(limit && { take: 5 }),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async clientDashboardInfo(
    range?: DashboardDateRangeDto,
    seller?: UserEntity,
  ) {
    const clients = await this.getActiveClients(range, seller, true, true);

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

  private async getRevenue(range?: DashboardDateRangeDto) {
    if (!range) {
      let endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      let startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);

      range = { startRange, endRange };
    }

    range.endRange = new Date(range.endRange.setUTCHours(23, 59, 59, 999));
    range.startRange = new Date(range.startRange.setUTCHours(0, 0, 0, 0));

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

  private async getOrderInfo(
    range?: DashboardDateRangeDto,
    seller?: UserEntity,
  ) {
    if (!range) {
      let endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      let startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);

      range = { startRange, endRange };
    }

    range.endRange = new Date(range.endRange.setUTCHours(23, 59, 59, 999));
    range.startRange = new Date(range.startRange.setUTCHours(0, 0, 0, 0));

    const orders = await this.database.order.findMany({
      where: {
        createdAt: { gte: range.startRange, lte: range.endRange },
        ...(seller &&
          seller.role === RoleEnum.SELLER && { sellerId: seller.id }),
      },
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

  private async getCommission(
    range?: DashboardDateRangeDto,
    seller?: UserEntity,
  ) {
    if (!range) {
      let endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      let startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);

      range = { startRange, endRange };
    }

    range.endRange = new Date(range.endRange.setUTCHours(23, 59, 59, 999));
    range.startRange = new Date(range.startRange.setUTCHours(0, 0, 0, 0));

    const orders = await this.database.order.findMany({
      where: {
        createdAt: { gte: range.startRange, lte: range.endRange },
        ...(seller &&
          seller.role === RoleEnum.SELLER && { sellerId: seller.id }),
      },
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
