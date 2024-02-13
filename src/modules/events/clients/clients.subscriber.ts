import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DeleteClientEvent,
  RestoreClientEvent,
  UpdateClientEvent,
} from './clients.event';
import { DatabaseService } from '@modules/database/services/database.service';
import { ClientEntity } from '@modules/clients/entities/client.entity';

@Injectable()
export class ClientSubscriber {
  constructor(private readonly database: DatabaseService) {}

  @OnEvent(DeleteClientEvent.name)
  async handleDeleteClientEvent(event: DeleteClientEvent): Promise<void> {
    const clientId = event.client.id;
    await this.handleClientDeletion(clientId);
  }

  @OnEvent(UpdateClientEvent.name)
  async handleUpdateClientEvent(event: UpdateClientEvent): Promise<void> {
    const client = event.client;
    await this.handleUpdateClientOrderBrand(client);
  }

  @OnEvent(RestoreClientEvent.name)
  async handleRestoreClientEvent(event: RestoreClientEvent): Promise<void> {
    const clientId = event.client.id;
    await this.handleClientRestoration(clientId);
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
  private async handleClientDeletion(clientId: number): Promise<void> {
    const database = await this.database.softDelete();
    await database.order.deleteMany({
      where: { clientId },
    });
  }

  private async handleClientRestoration(clientId: number): Promise<void> {
    const foundDeletedOrders = await this.database.order.findMany({
      where: { clientId, deletedAt: { not: null } },
    });

    const orderIds = foundDeletedOrders.map((order) => order.id);

    await this.database.order.updateMany({
      where: {
        id: { in: orderIds },
      },
      data: {
        deletedAt: null,
      },
    });
  }
}
