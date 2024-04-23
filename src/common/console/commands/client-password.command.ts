import { HashService } from '@modules/auth/services/hash.service';
import { DatabaseService } from '@modules/database/services/database.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';
import { delay } from '@src/common/helpers/delay';
import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'generate:client-pass',
})
export class ClientPasswordCommand extends CommandRunner {
  constructor(
    private readonly database: DatabaseService,
    private readonly hashService: HashService,
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
      where: { id: { gte: 147 } },
      orderBy: { id: 'asc' },
    });

    for (const client of clients) {
      try {
        const { hash, text } = await this.hashService.generateAndHashPassword();

        client.password = hash;

        this.logger.debug(`Updating Client ID: ${client.id}`);
        this.logger.debug(`Updating Client Name: ${client.name}`);

        await this.database.$transaction(async (tx) => {
          return await tx.client.update({
            where: { id: client.id },
            data: { password: client.password },
          });
        });

        const link = process.env.FE_OCP_ROUTE;
        const password = text;
        const email = client.email;

        const data = {
          link,
          password,
          email,
        };

        await this.mailerService.sendMail({
          to: email,
          subject: `Exciting News: We've Moved to a New Customer Portal!`,
          template: 'forgot-password',
          context: data,
        });

        await delay(5 * 1000);
      } catch (error) {
        this.logger.error(
          `Error for ${client.id}: ${client.name}, ${client.email}`,
        );
      }
    }

    this.logger.debug('Success!');
  }
}
