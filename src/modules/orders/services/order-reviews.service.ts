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

    const newReview = await this.database.orderReview.create({
      data: {
        orderId,
        ...data,
      },
    });

    const orderReviews = await this.database.orderReview.findMany({
      where: { orderId },
      include: { order: true },
    });

    await this.database.order.update({
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
  }

  async update(
    id: number,
    updateOrderReviewDto: UpdateOrderReviewDto,
    authUser: UserEntity,
  ) {
    const oldReview = await this.database.orderReview.findUnique({
      where: { id },
    });

    const updatedReview = await this.database.orderReview.update({
      where: { id },
      data: updateOrderReviewDto,
    });

    // ? Create a Log for the Order
    await this.orderLogsService.createLog(updatedReview.orderId, authUser, {
      action: `Reviewer: ${updatedReview.name} status has been updated from ${oldReview.status} to ${updatedReview.status}`,
    });

    return updatedReview;
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
