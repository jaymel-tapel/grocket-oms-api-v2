import { Client } from '@prisma/client';

class ClientEvent {
  constructor(public readonly client: Client) {}
}

export class DeleteClientEvent extends ClientEvent {}
export class RestoreClientEvent extends ClientEvent {}
