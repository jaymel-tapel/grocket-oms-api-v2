import { Module } from '@nestjs/common';
import { ProspectsService } from './services/prospects.service';
import { ProspectsController } from './prospects.controller';
import { ProspectTemplatesService } from './services/prospect-templates.service';
import { ProspectSendMailService } from './services/prospect-send-email.service';
import { ProspectLogsService } from './services/prospect-logs.service';
import { ProspectTemplatesController } from './prospect-templates.controller';

@Module({
  controllers: [ProspectsController, ProspectTemplatesController],
  providers: [
    ProspectsService,
    ProspectTemplatesService,
    ProspectSendMailService,
    ProspectLogsService,
  ],
  exports: [
    ProspectsService,
    ProspectTemplatesService,
    ProspectSendMailService,
  ],
})
export class ProspectsModule {}
