import { Injectable } from '@nestjs/common';
import {
  DeleteClientEvent,
  RestoreClientEvent,
  UpdateClientEvent,
} from '../clients/clients.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client } from '@prisma/client';
import { UserEntity } from '@modules/users/entities/user.entity';

@Injectable()
export class EventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitUpdateClientEvent(client: Client): void {
    this.eventEmitter.emit(
      UpdateClientEvent.name,
      new UpdateClientEvent(client),
    );
  }

  emitDeleteClientEvent(client: Client, authUser: UserEntity): void {
    this.eventEmitter.emit(
      DeleteClientEvent.name,
      new DeleteClientEvent(client),
      authUser,
    );
  }

  emitRestoreClientEvent(client: Client, authUser: UserEntity): void {
    this.eventEmitter.emit(
      RestoreClientEvent.name,
      new RestoreClientEvent(client),
      authUser,
    );
  }
}
