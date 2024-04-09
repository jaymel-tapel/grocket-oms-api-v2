import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DeleteClientEvent,
  RestoreClientEvent,
  UpdateClientEvent,
} from './clients.event';
import { DatabaseService } from '@modules/database/services/database.service';
import { ClientEntity } from '@modules/clients/entities/client.entity';
import { OrdersService } from '../../orders/services/orders.service';
import { UserEntity } from '@modules/users/entities/user.entity';

@Injectable()
export class ClientSubscriber {
  constructor(
    private readonly database: DatabaseService,
    private readonly ordersService: OrdersService,
  ) {}

  @OnEvent(DeleteClientEvent.name)
  async handleDeleteClientEvent(
    event: DeleteClientEvent,
    authUser: UserEntity,
  ): Promise<void> {
    const clientId = event.client.id;
    await this.handleClientDeletion(clientId, authUser);
  }

  @OnEvent(UpdateClientEvent.name)
  async handleUpdateClientEvent(event: UpdateClientEvent): Promise<void> {
    const client = event.client;
    await this.handleUpdateClientOrderBrand(client);
  }

  @OnEvent(RestoreClientEvent.name)
  async handleRestoreClientEvent(
    event: RestoreClientEvent,
    authUser: UserEntity,
  ): Promise<void> {
    const clientId = event.client.id;
    await this.handleClientRestoration(clientId, authUser);
  }

  private async handleUpdateClientOrderBrand(
    client: ClientEntity,
  ): Promise<void> {
    const database = await this.database.softDelete();
    await database.order.updateMany({
      where: { clientId: client.id },
      data: { brandId: client.clientInfo.brandId },
    });
  }

  // ? Delete orders associated with the client
  private async handleClientDeletion(
    clientId: number,
    authUser: UserEntity,
  ): Promise<void> {
    const database = await this.database.softDelete();

    const orders = await database.order.findMany({
      where: { clientId },
      select: { id: true },
    });

    const promiseDeleteOrders = orders.map(({ id }) =>
      this.ordersService.remove(id, authUser),
    );

    await Promise.all(promiseDeleteOrders);
  }

  private async handleClientRestoration(
    clientId: number,
    authUser: UserEntity,
  ): Promise<void> {
    const foundDeletedOrders = await this.database.order.findMany({
      where: { clientId, deletedAt: { not: null } },
      select: { id: true },
    });

    const promiseRestoreOrders = foundDeletedOrders.map(({ id }) =>
      this.ordersService.restore(id, authUser),
    );

    await Promise.all(promiseRestoreOrders);
  }
}
