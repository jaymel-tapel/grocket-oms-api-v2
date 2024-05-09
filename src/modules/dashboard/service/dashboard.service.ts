import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import { DashboardDateRangeDto } from '../dto/date-range.dto';
import { addDays, subDays } from 'date-fns';
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

  async admin(dateRangeDto?: DashboardDateRangeDto) {
    return {
      ordersOverview: await this.getOrderPercentage(dateRangeDto),
      newClientsCount: (await this.getActiveClients(dateRangeDto)).length,
      revenue: await this.getRevenue(dateRangeDto),
      clientsOverview: await this.clientDashboardInfo(dateRangeDto),
    };
  }

  async adminGraph(dateRangeDto?: DashboardDateRangeDto) {
    let { startRange, endRange, code } = dateRangeDto;

    if (!startRange || !endRange) {
      endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);
    }

    endRange = new Date(endRange.setUTCHours(23, 59, 59, 999));
    startRange = new Date(startRange.setUTCHours(0, 0, 0, 0));

    const orders = await this.database.order.findMany({
      where: { createdAt: { gte: startRange, lte: endRange }, brand: { code } },
      include: { orderReviews: true },
    });

    const datesArray: Date[] = [];
    let tempStartDate: Date = startRange;

    while (tempStartDate <= endRange) {
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

  async seller(authUser: UserEntity, dateRangeDto?: DashboardDateRangeDto) {
    return {
      newOrdersCount: (await this.getOrders(dateRangeDto, authUser)).length,
      newClientsCount: (await this.getActiveClients(dateRangeDto, authUser))
        .length,
      ...(await this.getCommission(dateRangeDto, authUser)),
      ordersOverview: await this.getOrderInfo(dateRangeDto, authUser),
      clientsOverview: await this.clientDashboardInfo(dateRangeDto, authUser),
    };
  }

  private async getOrders(
    dateRangeDto?: DashboardDateRangeDto,
    seller?: UserEntity,
  ) {
    let { startRange, endRange, code } = dateRangeDto;
    if (!startRange || !endRange) {
      endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);
    }

    endRange = new Date(endRange.setUTCHours(23, 59, 59, 999));
    startRange = new Date(startRange.setUTCHours(0, 0, 0, 0));

    return await this.database.order.findMany({
      where: {
        createdAt: { gte: startRange, lte: endRange },
        ...(seller &&
          seller.role === RoleEnum.SELLER && { sellerId: seller.id }),
        brand: { code },
      },
    });
  }

  async sellerGraph(
    authUser: UserEntity,
    dateRangeDto?: DashboardDateRangeDto,
  ) {
    let { startRange, endRange, code } = dateRangeDto;

    if (!startRange || !endRange) {
      endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);
    }

    endRange = new Date(endRange.setUTCHours(23, 59, 59, 999));
    startRange = new Date(startRange.setUTCHours(0, 0, 0, 0));

    const orders = await this.database.order.findMany({
      where: {
        createdAt: { gte: startRange, lte: endRange },
        payment_status: PaymentStatusEnum.NEW,
        sellerId: authUser.id,
        brand: { code },
      },
    });

    const datesArray: Date[] = [];
    let tempStartDate: Date = startRange;

    while (tempStartDate <= endRange) {
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

  private async getOrderPercentage(dateRangeDto?: DashboardDateRangeDto) {
    let { startRange, endRange } = dateRangeDto;
    if (!startRange || !endRange) {
      endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);
    }

    endRange = new Date(endRange.setUTCHours(23, 59, 59, 999));
    startRange = new Date(startRange.setUTCHours(0, 0, 0, 0));

    const orders = await this.getOrders(dateRangeDto);

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
      newOrdersPercent: newOrdersPercent || 0,
      paidOrdersPercent: paidOrdersPercent || 0,
      invoiceOrdersPercent: invoiceOrdersPercent || 0,
      pr1Percent: pr1Percent || 0,
      pr2Percent: pr2Percent || 0,
    };
  }

  private async getActiveClients(
    dateRangeDto?: DashboardDateRangeDto,
    seller?: UserEntity,
    getAll?: boolean,
    limit?: boolean,
  ) {
    let { startRange, endRange, code } = dateRangeDto;
    if (!startRange || !endRange) {
      endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);
    }

    endRange = new Date(endRange.setUTCHours(23, 59, 59, 999));
    startRange = new Date(startRange.setUTCHours(0, 0, 0, 0));

    const whereClause: Prisma.ClientWhereInput = {
      deletedAt: null,
      clientInfo: { brand: { code } },
    };

    if (!getAll) {
      whereClause.createdAt = {
        gte: startRange,
        lte: endRange,
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
    dateRangeDto?: DashboardDateRangeDto,
    seller?: UserEntity,
  ) {
    const clients = await this.getActiveClients(
      dateRangeDto,
      seller,
      true,
      true,
    );

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

  private async getRevenue(dateRangeDto?: DashboardDateRangeDto) {
    let { startRange, endRange, code } = dateRangeDto;

    if (!startRange || !endRange) {
      endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);
    }

    endRange = new Date(endRange.setUTCHours(23, 59, 59, 999));
    startRange = new Date(startRange.setUTCHours(0, 0, 0, 0));

    const orders = await this.database.order.findMany({
      where: { createdAt: { gte: startRange, lte: endRange }, brand: { code } },
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
    dateRangeDto?: DashboardDateRangeDto,
    seller?: UserEntity,
  ) {
    let { startRange, endRange, code } = dateRangeDto;

    if (!startRange || !endRange) {
      endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);
    }

    endRange = new Date(endRange.setUTCHours(23, 59, 59, 999));
    startRange = new Date(startRange.setUTCHours(0, 0, 0, 0));

    const orders = await this.database.order.findMany({
      where: {
        createdAt: { gte: startRange, lte: endRange },
        ...(seller &&
          seller.role === RoleEnum.SELLER && { sellerId: seller.id }),
        brand: { code },
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
    dateRangeDto?: DashboardDateRangeDto,
    seller?: UserEntity,
  ) {
    let { startRange, endRange, code } = dateRangeDto;

    if (!startRange || !endRange) {
      endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
      startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);
    }

    endRange = new Date(endRange.setUTCHours(23, 59, 59, 999));
    startRange = new Date(startRange.setUTCHours(0, 0, 0, 0));

    const orders = await this.database.order.findMany({
      where: {
        createdAt: { gte: startRange, lte: endRange },
        ...(seller &&
          seller.role === RoleEnum.SELLER && { sellerId: seller.id }),
        brand: { code },
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
