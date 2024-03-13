import { Logger } from '@nestjs/common';
import { ClientPasswordCommand } from '../commands/client-password';
import { ClientIndustryCommand } from './client-industry-seed';
import { ClientSourceCommand } from './client-source-seed';
import { ProspectTemplateCommand } from './prospect-template-seed';

export const Commands = [
  ClientSourceCommand,
  ClientIndustryCommand,
  ClientPasswordCommand,
  ProspectTemplateCommand,
  Logger,
];
