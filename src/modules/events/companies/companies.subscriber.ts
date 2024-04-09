import { DatabaseService } from '@modules/database/services/database.service';
import { OrdersService } from '@modules/orders/services/orders.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeleteCompanyEvent, RestoreCompanyEvent } from './companies.event';
import { UserEntity } from '@modules/users/entities/user.entity';

@Injectable()
export class CompaniesSubscriber {
  constructor(
    private readonly database: DatabaseService,
    private readonly ordersService: OrdersService,
  ) {}

  @OnEvent(DeleteCompanyEvent.name)
  async handleDeleteCompanyEvent(
    event: DeleteCompanyEvent,
    authUser: UserEntity,
  ): Promise<void> {
    const companyId = event.company.id;
    await this.handleCompanyDeletion(companyId, authUser);
  }

  @OnEvent(RestoreCompanyEvent.name)
  async handleRestoreCompanyEvent(
    event: RestoreCompanyEvent,
    authUser: UserEntity,
  ): Promise<void> {
    const companyId = event.company.id;
    await this.handleCompanyRestoration(companyId, authUser);
  }

  private async handleCompanyDeletion(companyId: number, authUser: UserEntity) {
    const database = await this.database.softDelete();

    const orders = await database.order.findMany({
      where: { companyId },
      select: { id: true },
    });

    const promiseDeleteOrders = orders.map(({ id }) =>
      this.ordersService.remove(id, authUser),
    );

    await Promise.all(promiseDeleteOrders);
  }

  private async handleCompanyRestoration(
    companyId: number,
    authUser: UserEntity,
  ): Promise<void> {
    const foundDeletedOrders = await this.database.order.findMany({
      where: { companyId, deletedAt: { not: null } },
      select: { id: true },
    });

    const promiseRestoreOrders = foundDeletedOrders.map(({ id }) =>
      this.ordersService.restore(id, authUser),
    );

    await Promise.all(promiseRestoreOrders);
  }
}
