import { HashService } from '@modules/auth/services/hash.service';
import { DatabaseService } from '@modules/database/services/database.service';
import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'generate:client-pass',
})
export class ClientPasswordCommand extends CommandRunner {
  constructor(
    private readonly database: DatabaseService,
    private readonly hashService: HashService,
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
        client.password = (
          await this.hashService.generateAndHashPassword()
        ).hash;

        this.logger.debug(`Updating Client ID: ${client.id}`);
        this.logger.debug(`Updating Client Name: ${client.name}`);

        return await this.database.$transaction(async (tx) => {
          return await tx.client.update({
            where: { id: client.id },
            data: { password: client.password },
          });
        });
      }),
    );

    this.logger.debug('Success!');
  }
}
