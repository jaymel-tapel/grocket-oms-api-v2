import { Logger } from '@nestjs/common';
import { ClientPasswordCommand } from '../commands/client-password';
import { ClientIndustryCommand } from './client-industry-seed';
import { ClientSourceCommand } from './client-source-seed';
import { ProspectTemplateCommand } from './prospect-template-seed';
import { ProspectsDummyDataCommand } from './prospect-session-dummy-data';

export const Commands = [
  Logger,
  ClientSourceCommand,
  ClientIndustryCommand,
  ClientPasswordCommand,
  ProspectTemplateCommand,
  ProspectsDummyDataCommand,
];
