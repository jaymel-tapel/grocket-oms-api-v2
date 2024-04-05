import { DatabaseService } from '@modules/database/services/database.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { CreateOrderLogDto } from '../dto/create-order-log.dto';

@Injectable()
export class OrderLogsService {
  constructor(private readonly database: DatabaseService) {}

  async createLog(
    id: number,
    authUser: UserEntity,
    createOrderLogDto: CreateOrderLogDto,
  ) {
    const order = await this.database.order.findUniqueOrThrow({
      where: { id },
    });

    return await this.database.orderLog.create({
      data: {
        order: { connect: { id: order.id } },
        by: authUser.email,
        ...createOrderLogDto,
      },
    });
  }

  async findManyByOrderId(orderId: number) {
    const database = await this.database.softDelete();
    return await database.orderLog.findMany({
      where: { orderId },
    });
  }
}
