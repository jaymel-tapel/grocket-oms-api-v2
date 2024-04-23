import { HashService } from '@modules/auth/services/hash.service';
import { DatabaseService } from '@modules/database/services/database.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';
import { delay } from '@src/common/helpers/delay';
import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'generate:user-pass',
})
export class UserPasswordCommand extends CommandRunner {
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
    const database = await this.database.softDelete();
    const users = await database.user.findMany();

    for (const user of users) {
      const { hash, text } = await this.hashService.generateAndHashPassword();

      user.password = hash;

      this.logger.debug(`Updating User ID: ${user.id}`);
      this.logger.debug(`Updating User Name: ${user.name}`);

      await this.database.$transaction(async (tx) => {
        return await tx.user.update({
          where: { id: user.id },
          data: { password: user.password },
        });
      });

      // ? It will send the text password to the user
      if (user.email.includes('@')) {
        const link = process.env.FE_OMS_ROUTE;
        const password = text;
        const email = user.email;

        const data = {
          link,
          password,
          email,
        };

        await this.mailerService.sendMail({
          to: email,
          subject: `Reset Password`,
          template: 'forgot-password',
          context: data,
        });

        await delay(5 * 1000);
      }
    }

    this.logger.debug('Success!');
  }
}
