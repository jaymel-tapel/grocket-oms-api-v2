import { ClientEntity } from '@modules/clients/entities/client.entity';

class ClientEvent {
  constructor(public readonly client: ClientEntity) {}
}

export class UpdateClientEvent extends ClientEvent {}
export class DeleteClientEvent extends ClientEvent {}
export class RestoreClientEvent extends ClientEvent {}
