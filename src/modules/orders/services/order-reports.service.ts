import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import { OrderReportDateRangeDto } from '../dto/get-order-report.dto';
import { OrderReviewStatus, PaymentStatusEnum, Prisma } from '@prisma/client';
import { subDays } from 'date-fns';
import { dateRange } from '@src/common/helpers/date-range';
import * as _ from 'lodash';

@Injectable()
export class OrderReportsService {
  constructor(private readonly database: DatabaseService) {}

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

  async orderGraphReport(dateRangeDto: OrderReportDateRangeDto) {
    const database = await this.database.softDelete();
    const { startRange, endRange, orderQuery } = await this.baseReport(
      dateRangeDto,
    );

    const orders = await database.order.findMany({
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
}
