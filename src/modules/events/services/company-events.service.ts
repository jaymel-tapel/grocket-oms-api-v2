import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompanyEntity } from '@modules/companies/entities/company.entity';
import {
  DeleteCompanyEvent,
  RestoreCompanyEvent,
} from '../companies/companies.event';

@Injectable()
export class CompanyEventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

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
