import { Module } from '@nestjs/common';
import { ProspectsService } from './services/prospects.service';
import { ProspectsController } from './prospects.controller';
import { ProspectTemplatesService } from './services/prospect-templates.service';
import { ProspectSendMailService } from './services/prospect-send-email.service';
import { ProspectLogsService } from './services/prospect-logs.service';
import { ProspectTemplatesController } from './prospect-templates.controller';
import { ProspectSessionService } from './services/prospect-session.service';
import { ProspectSessionController } from './prospect-session.controller';

@Module({
  controllers: [
    ProspectsController,
    ProspectTemplatesController,
    ProspectSessionController,
  ],
  providers: [
    ProspectsService,
    ProspectTemplatesService,
    ProspectSendMailService,
    ProspectLogsService,
    ProspectSessionService,
  ],
  exports: [
    ProspectsService,
    ProspectTemplatesService,
    ProspectSendMailService,
    ProspectSessionService,
  ],
})
export class ProspectsModule {}
