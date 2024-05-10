import { Logger } from '@nestjs/common';
import { ClientPasswordCommand } from './commands/client-password.command';
import { ClientIndustryCommand } from './seeders/client-industry-seed';
import { ClientSourceCommand } from './seeders/client-source-seed';
import { ProspectTemplateCommand } from './seeders/prospect-template-seed';
import { ProspectsDummyDataCommand } from './seeders/prospect-session-dummy-data';
import { CheckOrderCommand } from './commands/check-orders.command';
import { CheckPaymentCommand } from './commands/check-payments.command';
import { UserPasswordCommand } from './commands/user-password.command';
import { FillGapDailyRatingsCommand } from './commands/fill-gap-daily-ratings.command';
import { RestoreDeletedOrdersCommand } from './commands/restore-all-roders.command';
import { ClientMassEmailCommand } from './commands/mass-email.command';

export const Commands = [
  Logger,
  ClientSourceCommand,
  ClientIndustryCommand,
  ClientPasswordCommand,
  UserPasswordCommand,
  ProspectTemplateCommand,
  ProspectsDummyDataCommand,
  CheckOrderCommand,
  CheckPaymentCommand,
  FillGapDailyRatingsCommand,
  RestoreDeletedOrdersCommand,
  ClientMassEmailCommand,
];
