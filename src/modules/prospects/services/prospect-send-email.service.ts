import { Injectable } from '@nestjs/common';
import { ProspectEntity } from '../entities/prospect.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { compile } from 'handlebars';
import { ProspectTemplate } from '@prisma/client';
import { ProspectLogsService } from './prospect-logs.service';
import { UserEntity } from '@modules/users/entities/user.entity';

@Injectable()
export class ProspectSendMailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prospectLogsService: ProspectLogsService,
  ) {}

  async send(prospect: ProspectEntity, authUser: UserEntity) {
    const template = prospect.prospectTemplate;

    const compiledTemplate = compile(template.content);
    const dynamicContent = compiledTemplate({ ...prospect });

    await this.mailerService.sendMail({
      to: prospect.email,
      subject: template.subject,
      template: 'prospect-email-template',
      context: { dynamicContent },
    });

    await this.prospectLogsService.createLog(prospect.id, authUser, {
      templateId: template.id,
      action: `${template.name} template`,
    });

    return { message: `Email sent successfully!` };
  }

  async manualSend(
    prospect: ProspectEntity,
    template: ProspectTemplate,
    authUser: UserEntity,
  ) {
    const compiledTemplate = compile(template.content);
    const dynamicContent = compiledTemplate({ ...prospect });

    await this.mailerService.sendMail({
      to: prospect.email,
      subject: template.subject,
      template: 'prospect-email-template',
      context: { dynamicContent },
    });

    await this.prospectLogsService.createLog(prospect.id, authUser, {
      templateId: template.id,
      action: `${template.name} template`,
    });

    return { message: `Email sent successfully!` };
  }
}
