import { DatabaseService } from '@modules/database/services/database.service';
import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'fill:client-seller-email',
})
export class FillClientSellerEmailCommand extends CommandRunner {
  private readonly logger = new Logger(FillClientSellerEmailCommand.name);

  constructor(private readonly database: DatabaseService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const clients = await this.database.client.findMany({
      where: {
        orders: { some: {} },
      },
      include: {
        orders: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    clients.forEach(async (client) => {
      try {
        this.logger.debug(`Updating Client ID: ${client.id}`);
        this.logger.debug(`Updating Client Name: ${client.name}`);
        console.log(``);

        const order = client.orders[0];

        await this.database.client.update({
          where: { id: client.id },
          data: {
            seller_email: order.seller_email,
          },
        });
      } catch (error) {
        this.logger.error(
          `Error for ${client.id}: ${client.name}, ${client.email}`,
        );
      }
    });

    this.logger.verbose(`Success!`);
  }
}
