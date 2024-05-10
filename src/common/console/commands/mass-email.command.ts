import { DatabaseService } from '@modules/database/services/database.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';
import { delay } from '@src/common/helpers/delay';
import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'send:mass-email-client',
})
export class ClientMassEmailCommand extends CommandRunner {
  constructor(
    private readonly database: DatabaseService,
    private readonly mailerService: MailerService,
    private readonly logger: Logger,
  ) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const clients = await this.database.client.findMany({
      orderBy: { id: 'desc' },
    });

    this.logger.verbose(`Sending Mass Email...`);

    for (const client of clients) {
      try {
        this.logger.debug(`Client ID: ${client.id}`);
        this.logger.debug(`Client Name: ${client.name}`);
        this.logger.debug(`Client Email: ${client.email}`);
        console.log(``);

        await this.mailerService.sendMail({
          to: client.email,
          from: `"G-Rocket" <support@g-rocket.de>`,
          subject: `G-Rocket wird zu Reputationshelfer`,
          template: 'mass-email-client',
        });

        await delay(3 * 1000);
      } catch (error) {
        this.logger.error(
          `Error for ${client.id}: ${client.name}, ${client.email}`,
        );
      }
    }

    this.logger.debug('Success!');
  }
}
