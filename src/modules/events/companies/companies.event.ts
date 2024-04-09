import { CompanyEntity } from '@modules/companies/entities/company.entity';

class CompanyEvent {
  constructor(public readonly company: CompanyEntity) {}
}

export class DeleteCompanyEvent extends CompanyEvent {}
export class RestoreCompanyEvent extends CompanyEvent {}
