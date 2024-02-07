import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import { OrderReportDateRangeDto } from '../dto/get-order-report.dto';
import { OrderReviewStatus, PaymentStatusEnum, Prisma } from '@prisma/client';
import { addDays, eachDayOfInterval, subDays } from 'date-fns';
import { dateRange } from '@src/common/helpers/date-range';
import * as _ from 'lodash';
import { IOrderReport } from '../interfaces/order-report.interface';

@Injectable()
export class OrderReportsService {
  constructor(private readonly database: DatabaseService) {}

  // * Order and Paid Orders Count Reports
  async orderReport(dateRangeDto: OrderReportDateRangeDto) {
    const baseReport = await this.baseReport(dateRangeDto);

    const foundOrders = await this.findAllOrdersByRange(baseReport);
    const foundPaidOrders = await this.findAllOrdersByRange({
      ...baseReport,
      orderQuery: { where: { payment_status: 'PAID' } },
    });

    const datesArray = eachDayOfInterval({
      start: baseReport.startRange,
      end: baseReport.endRange,
    });

    const ordersObj: { [key: string]: number } = {};
    const paidOrdersObj = { ...ordersObj };

    datesArray.forEach((date) => {
      date = addDays(date.setUTCHours(0, 0, 0, 0), 1);
      ordersObj[date.toISOString()] = 0;
      paidOrdersObj[date.toISOString()] = 0;
    });

    for (const order of foundOrders) {
      order.createdAt.setUTCHours(0, 0, 0, 0);
      const date = order.createdAt.toISOString();
      ordersObj[date]++;
    }

    for (const paidOrder of foundPaidOrders) {
      paidOrder.createdAt.setUTCHours(0, 0, 0, 0);
      const date = paidOrder.createdAt.toISOString();
      paidOrdersObj[date]++;
    }

    const orders = Object.keys(ordersObj).map((date) => ({
      date: new Date(date),
      count: ordersObj[date],
    }));

    const paidOrders = Object.keys(paidOrdersObj).map((date) => ({
      date: new Date(date),
      count: paidOrdersObj[date],
    }));

    const totalOrderReviews = foundOrders.reduce(
      (sum, orders) => sum + orders.orderReviews.length,
      0,
    );

    const avg_amount_of_reviews = totalOrderReviews / foundOrders.length;

    const avg_unit_cost = foundOrders.reduce(
      (sum, orders) => sum + Number(orders.unit_cost),
      0,
    );

    return {
      total_orders: foundOrders.length,
      total_paid_orders: foundPaidOrders.length,
      avg_amount_of_reviews,
      avg_unit_cost,
      orders,
      paidOrders,
    };
  }

  // * Order Bar and Pie Graph Reports
  async orderGraphReport(dateRangeDto: OrderReportDateRangeDto) {
    const baseReport = await this.baseReport(dateRangeDto);
    const orders = await this.findAllOrdersByRange(baseReport);

    const orderReviews = orders.flatMap((order) => order.orderReviews);

    const groupedOrders = _.groupBy(orders, 'payment_status');
    const groupedOrderReviews = _.groupBy(orderReviews, 'status');

    const initPaymentStatus = Object.values(PaymentStatusEnum).map(
      (status) => ({
        payment_status: status,
        count: 0,
        amount: 0,
        percentage: 0,
      }),
    );

    const orderPaymentStatus = initPaymentStatus.map((initStatus) => {
      const payment_status = initStatus.payment_status;
      const group = groupedOrders[payment_status] || [];
      const count = group.length;
      const amount = _.sumBy(group, (order) => {
        const unitCost = +order.unit_cost;
        const orderReviewsGeloscht = order.orderReviews.filter(
          (review) => review.status === 'GELOSCHT',
        ).length;
        return unitCost * orderReviewsGeloscht;
      });

      const percentage = (count / orders.length) * 100;

      return {
        payment_status,
        count,
        amount: _.round(amount, 2),
        percentage: _.round(percentage, 2),
      };
    });

    const initOrderReviewStatus = Object.values(OrderReviewStatus).map(
      (status) => ({
        order_review_status: status,
        count: 0,
        amount: 0,
        percentage: 0,
      }),
    );

    const orderReviewStatus = initOrderReviewStatus.map((initReviewStatus) => {
      const order_review_status = initReviewStatus.order_review_status;
      const group = groupedOrderReviews[order_review_status] || [];
      const count = group.length;
      const amount = _.sumBy(group, (review) => {
        const order = orders.find((order) => order.id === review.orderId);
        return +order.unit_cost;
      });

      const percentage = (count / orderReviews.length) * 100;

      return {
        order_review_status,
        count,
        amount: _.round(amount, 2),
        percentage: _.round(percentage, 2),
      };
    });

    return { orderPaymentStatus, orderReviewStatus };
  }

  private async baseReport(dateRangeDto: OrderReportDateRangeDto) {
    let { startRange, endRange, sellerId } = dateRangeDto;
    let orderQuery: Prisma.OrderFindManyArgs = {};

    // ? Last 30 Days
    if (!startRange && !endRange) {
      startRange = subDays(new Date().setUTCHours(0, 0, 0, 0), 30);
      endRange = new Date(new Date().setUTCHours(23, 59, 59, 999));
    } else {
      const dateRangeHelper = await dateRange(
        { from: startRange, to: endRange },
        this.database,
        'order',
      );
      startRange = dateRangeHelper.startDate;
      endRange = dateRangeHelper.endDate;
    }

    if (sellerId) {
      orderQuery = {
        where: { sellerId },
      };
    }

    return { startRange, endRange, orderQuery };
  }

  private async findAllOrdersByRange({
    startRange,
    endRange,
    orderQuery,
  }: IOrderReport) {
    const database = await this.database.softDelete();
    return await database.order.findMany({
      where: {
        ...orderQuery.where,
        createdAt: {
          gte: startRange,
          lte: endRange,
        },
      },
      include: {
        orderReviews: true,
      },
    });
  }
}
