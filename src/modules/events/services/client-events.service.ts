import { ClientEntity } from '@modules/clients/entities/client.entity';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DeleteClientEvent,
  RestoreClientEvent,
  UpdateClientEvent,
} from '../clients/clients.event';

@Injectable()
export class ClientEventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async emitUpdateClientEvent(client: ClientEntity) {
    this.eventEmitter.emit(
      UpdateClientEvent.name,
      new UpdateClientEvent(client),
    );
  }

  async emitDeleteClientEvent(client: ClientEntity, authUser: UserEntity) {
    this.eventEmitter.emit(
      DeleteClientEvent.name,
      new DeleteClientEvent(client),
      authUser,
    );
  }

  async emitRestoreClientEvent(client: ClientEntity, authUser: UserEntity) {
    this.eventEmitter.emit(
      RestoreClientEvent.name,
      new RestoreClientEvent(client),
      authUser,
    );
  }
}
