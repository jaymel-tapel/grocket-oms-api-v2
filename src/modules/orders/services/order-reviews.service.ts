import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import { CreateOrderReviewWithOrderIDDto } from '../dto/create-order-review.dto';
import { OrderLogsService } from './order-logs.service';
import { UserEntity } from '../../users/entities/user.entity';
import { UpdateOrderReviewDto } from '../dto/update-order-review.dto';

@Injectable()
export class OrderReviewsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly orderLogsService: OrderLogsService,
  ) {}

  async create(
    authUser: UserEntity,
    createOrderReviewDto: CreateOrderReviewWithOrderIDDto,
  ) {
    const { orderId, ...data } = createOrderReviewDto;

    return await this.database.$transaction(async (tx) => {
      const newReview = await tx.orderReview.create({
        data: {
          orderId,
          ...data,
        },
      });

      const orderReviews = await tx.orderReview.findMany({
        where: { orderId },
        include: { order: true },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          total_price:
            orderReviews.length * Number(orderReviews[0].order.unit_cost),
        },
      });

      // ? Create a Log for the Order
      await this.orderLogsService.createLog(orderId, authUser, {
        action: 'order review created',
      });

      return newReview;
    });
  }

  async update(
    id: number,
    updateOrderReviewDto: UpdateOrderReviewDto,
    authUser: UserEntity,
  ) {
    return await this.database.$transaction(async (tx) => {
      const updatedReview = await tx.orderReview.update({
        where: { id },
        data: updateOrderReviewDto,
      });

      // ? Create a Log for the Order
      await this.orderLogsService.createLog(updatedReview.orderId, authUser, {
        action: 'order review updated',
      });

      return updatedReview;
    });
  }

  async remove(id: number, authUser: UserEntity) {
    const database = await this.database.softDelete();

    const deletedReview = await database.orderReview.delete({
      where: { id },
    });

    const orderReviews = await database.orderReview.findMany({
      where: { orderId: deletedReview.orderId },
      include: { order: true },
    });

    await database.order.update({
      where: { id: deletedReview.orderId },
      data: {
        total_price:
          orderReviews.length * Number(orderReviews[0].order.unit_cost),
      },
    });

    // ? Create a Log for the Order
    await this.orderLogsService.createLog(deletedReview.orderId, authUser, {
      action: 'order review deleted',
    });

    return deletedReview;
  }

  async findReviewsByOrderId(id: number, orderId: number) {
    const database = await this.database.softDelete();
    return await database.orderReview.findUnique({
      where: { id, orderId },
    });
  }

  async findManyReviews(reviewIds: number[]) {
    const database = await this.database.softDelete();
    return await database.orderReview.findMany({
      where: { id: { in: reviewIds } },
    });
  }

  async findManyReviewsByOrderId(orderId: number) {
    const database = await this.database.softDelete();
    return await database.orderReview.findMany({
      where: { orderId },
    });
  }
}
