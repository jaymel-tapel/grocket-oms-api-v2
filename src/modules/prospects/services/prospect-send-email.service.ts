import { HttpException, Injectable } from '@nestjs/common';
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

    const emails = prospect.emails;
    let ctr = 0;

    if (emails?.length === 0) {
      throw new HttpException(`No recipient(s) found`, 404);
    }

    const total_reviews = prospect.reviews;
    const countStars = prospect.stars;
    const rating = prospect.rating;

    const percentages = countStars.map((star, i) => {
      const percent = +((star / total_reviews) * 100).toFixed(2);
      return { [5 - i]: percent };
    });

    const starClass = [null, null, null, null, null];

    // ? Get the whole number of rating. ex: 4.5 -> 4
    const wholeRating = Math.floor(rating);

    // ? Get the decimal value of rating. ex: 4.5 -> 0.5
    const roundUp = +(rating % 1).toFixed(2);

    // ? Determine if there's a half star
    if (roundUp >= 0.4 && roundUp < 0.9) {
      starClass[wholeRating] = 'half-star';
    } else if (roundUp < 0.4 && rating < 5) {
      // ? If no half star, check for empty star
      starClass[wholeRating] = 'empty-star';
    }

    // ? Fill remaining slots with empty stars
    for (let i = wholeRating + 1; i < 5; i++) {
      starClass[i] = 'empty-star';
    }

    for (const recipient of emails) {
      try {
        await this.mailerService.sendMail({
          to: recipient,
          subject: template.subject,
          template: 'prospect-email-template',
          context: {
            rating,
            total_reviews,
            starClass,
            percentages,
            dynamicContent,
          },
        });

        await this.prospectLogsService.createLog(prospect.id, authUser, {
          templateId: template.id,
          action: `Email sent successfully`,
        });
      } catch (error) {
        ctr++;
        await this.prospectLogsService.createLog(prospect.id, authUser, {
          templateId: template.id,
          action: `Failed to send email`,
        });
        continue;
      }
    }

    return {
      message: `Email sent successfully!`,
      errors_count: ctr,
    };
  }

  async manualSend(
    prospect: ProspectEntity,
    template: ProspectTemplate,
    authUser: UserEntity,
  ) {
    const compiledTemplate = compile(template.content);
    const dynamicContent = compiledTemplate({ ...prospect });

    await this.mailerService.sendMail({
      to: prospect.emails,
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
