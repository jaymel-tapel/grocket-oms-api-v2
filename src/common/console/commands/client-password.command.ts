import { HashService } from '@modules/auth/services/hash.service';
import { DatabaseService } from '@modules/database/services/database.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';
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
    const clients = await this.database.client.findMany();

    await Promise.all(
      clients.map(async (client) => {
        const { hash, text } = await this.hashService.generateAndHashPassword();

        client.password = hash;

        this.logger.debug(`Updating Client ID: ${client.id}`);
        this.logger.debug(`Updating Client Name: ${client.name}`);

        const updatedClient = await this.database.$transaction(async (tx) => {
          return await tx.client.update({
            where: { id: client.id },
            data: { password: client.password },
          });
        });

        // ? It will send the text password to the client
        // await this.mailerService.sendMail({
        //   to: client.email,
        //   subject: `Password Reset`,
        //   html: `<p>Hi ${client.name},</p>
        //   <p>We migrated to the New Customer Portal and reset all our customers' passwords</p>
        //   <p>Here is your new password: ${text}</p>`,
        // });

        return updatedClient;
      }),
    );

    this.logger.debug('Success!');
  }
}
