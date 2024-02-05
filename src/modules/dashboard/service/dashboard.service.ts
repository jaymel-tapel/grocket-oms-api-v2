import { DatabaseService } from '@modules/database/services/database.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DateRangeDto } from '../dto/date-range.dto';
import { subDays } from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DashboardService {
  constructor(private readonly database: DatabaseService) {}

  async admin(range?: DateRangeDto) {
    if (Object.entries(range).length === 0) {
      const orders = await this.getOrderPercentage();
      const clients = await this.clientDashboardInfo();

      return { orders, clients };
    }

    if (!(range.startRange && range.endRange)) {
      throw new BadRequestException(
        'startRange and endRange should both be filled',
      );
    }

    const orders = await this.getOrderPercentage(
      range.startRange,
      range.endRange,
    );
    const clients = await this.clientDashboardInfo(
      range.startRange,
      range.endRange,
    );
    return { orders, clients };
  }

  private async getAllOrders(startRange?: Date, endRange?: Date) {
    if (!(startRange && endRange)) {
      startRange = new Date();
      endRange = subDays(startRange, 30);

      startRange.setUTCHours(23, 59, 59, 999);
      endRange.setUTCHours(0, 0, 0, 0);
    }

    return await this.database.order.findMany({
      where: {
        payment_status: 'NEW' || 'PAID' || 'SENT_INVOICE',
        createdAt: { gte: endRange, lte: startRange },
      },
    });
  }

  private async getOrderPercentage(startRange?: Date, endRange?: Date) {
    const allOrders = await this.getAllOrders(startRange, endRange);

    const newOrders = allOrders.filter(
      (order) => order.payment_status === 'NEW',
    );
    const paidOrders = allOrders.filter(
      (order) => order.payment_status === 'PAID',
    );
    const invoiceOrders = allOrders.filter(
      (order) => order.payment_status === 'SENT_INVOICE',
    );

    const totalOrderCount = allOrders.length;
    const newOrdersCount = newOrders.length;
    const paidOrdersCount = paidOrders.length;
    const invoiceOrdersCount = invoiceOrders.length;

    const newOrdersPercent = (newOrdersCount * 100) / totalOrderCount;
    const paidOrdersPercent = (paidOrdersCount * 100) / totalOrderCount;
    const invoiceOrdersPercent = (invoiceOrdersCount * 100) / totalOrderCount;

    return {
      totalOrderCount,
      newOrdersPercent,
      paidOrdersPercent,
      invoiceOrdersPercent,
    };
  }

  private async getActiveClients(startRange?: Date, endRange?: Date) {
    if (!(startRange && endRange)) {
      startRange = new Date();
      endRange = subDays(startRange, 30);

      startRange.setUTCHours(23, 59, 59, 999);
      endRange.setUTCHours(0, 0, 0, 0);
    }

    return await this.database.client.findMany({
      where: {
        createdAt: { gte: endRange, lte: startRange },
        deletedAt: null,
      },
      include: { clientInfo: { include: { industry: true } }, orders: true },
    });
  }

  // Add a way to disregard clients with no orders or no industry
  private async clientDashboardInfo(startRange?: Date, endRange?: Date) {
    const clients = await this.getActiveClients(startRange, endRange);

    const clientInfo = clients.map((client) => {
      const name = client.name;
      const email = client.email;
      const industry = client.clientInfo.industry?.name ?? null;
      const totalOrder = client.orders.length;
      let totalOrderCost = 0;
      client.orders.forEach((order) => {
        totalOrderCost += +order.total_price;
      });

      return { name, email, industry, totalOrder, totalOrderCost };
    });

    return clientInfo;
  }
}
