import { Injectable } from '@nestjs/common';
import {
  DeleteClientEvent,
  RestoreClientEvent,
} from '../clients/clients.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitDeleteClientEvent(client: Client): void {
    this.eventEmitter.emit(
      DeleteClientEvent.name,
      new DeleteClientEvent(client),
    );
  }

  emitRestoreClientEvent(client: Client): void {
    this.eventEmitter.emit(
      RestoreClientEvent.name,
      new RestoreClientEvent(client),
    );
  }
}
