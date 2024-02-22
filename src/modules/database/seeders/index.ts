import { Logger } from '@nestjs/common';
import { ClientPasswordCommand } from '../commands/client-password';
import { ClientIndustryCommand } from './client-industry-seed';
import { ClientSourceCommand } from './client-source-seed';

export const Commands = [
  ClientSourceCommand,
  ClientIndustryCommand,
  ClientPasswordCommand,
  Logger,
];
