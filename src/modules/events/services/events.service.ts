import { ClientEntity } from '@modules/clients/entities/client.entity';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DeleteClientEvent,
  RestoreClientEvent,
  UpdateClientEvent,
} from '../clients/clients.event';
import { CompanyEntity } from '@modules/companies/entities/company.entity';
import {
  DeleteCompanyEvent,
  RestoreCompanyEvent,
} from '../companies/companies.event';

@Injectable()
export class EventsService {
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

  async emitDeleteCompanyEvent(company: CompanyEntity, authUser: UserEntity) {
    this.eventEmitter.emit(
      DeleteCompanyEvent.name,
      new DeleteCompanyEvent(company),
      authUser,
    );
  }

  async emitRestoreCompanyEvent(company: CompanyEntity, authUser: UserEntity) {
    this.eventEmitter.emit(
      RestoreCompanyEvent.name,
      new RestoreCompanyEvent(company),
      authUser,
    );
  }
}
