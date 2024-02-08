import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeleteClientEvent, RestoreClientEvent } from './clients.event';
import { DatabaseService } from '@modules/database/services/database.service';

@Injectable()
export class ClientSubscriber {
  constructor(private readonly database: DatabaseService) {}

  @OnEvent(DeleteClientEvent.name)
  async handleDeleteClientEvent(event: DeleteClientEvent): Promise<void> {
    const clientId = event.client.id;
    await this.handleClientDeletion(clientId);
  }

  @OnEvent(RestoreClientEvent.name)
  async handleRestoreClientEvent(event: RestoreClientEvent): Promise<void> {
    const clientId = event.client.id;
    await this.handleClientRestoration(clientId);
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
