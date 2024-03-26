import { Logger } from '@nestjs/common';
import { ClientPasswordCommand } from './commands/client-password.command';
import { ClientIndustryCommand } from './seeders/client-industry-seed';
import { ClientSourceCommand } from './seeders/client-source-seed';
import { ProspectTemplateCommand } from './seeders/prospect-template-seed';
import { ProspectsDummyDataCommand } from './seeders/prospect-session-dummy-data';
import { CheckOrderCommand } from './commands/check-orders.command';
import { CheckPaymentCommand } from './commands/check-payments.command';

export const Commands = [
  Logger,
  ClientSourceCommand,
  ClientIndustryCommand,
  ClientPasswordCommand,
  ProspectTemplateCommand,
  ProspectsDummyDataCommand,
  CheckOrderCommand,
  CheckPaymentCommand,
];
