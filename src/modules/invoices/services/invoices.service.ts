import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { clientIncludeHelper } from '@modules/clients/helpers/client-include.helper';
import { OrderEntity } from '@modules/orders/entities/order.entity';

@Injectable()
export class InvoicesService {
  constructor(private readonly database: DatabaseService) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    const order = new OrderEntity(
      await this.database.order.findUniqueOrThrow({
        where: { id: createInvoiceDto.orderId },
        include: {
          client: {
            include: clientIncludeHelper({ include: { brand: true } }),
          },
          orderReviews: true,
        },
      }),
    );

    const brand = order.client.clientInfo.brand;

    const orderReviewerNames = order.orderReviews.map(
      (reviewer) => reviewer.name,
    );
    const quantity = orderReviewerNames.length;
    const amount = quantity * Number(order.unit_cost);

    const newInvoice = await this.database.invoice.create({
      data: {
        order: { connect: { id: order.id } },
        quantity,
        amount,
        rate: +order.unit_cost,
        brand: { connect: { id: brand.id } },
        review_names: orderReviewerNames,
      },
    });

    const invoiceId = this.generateInvoiceId(newInvoice.id);

    return await this.database.invoice.update({
      where: { id: newInvoice.id },
      data: {
        invoiceId,
      },
    });
  }

  private generateInvoiceId(id: number): string {
    return id.toString().padStart(10, '0');
  }
}
