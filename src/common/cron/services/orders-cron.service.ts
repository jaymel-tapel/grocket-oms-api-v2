import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaDynamicClient } from '@src/common/types/prisma.types';

@Injectable()
export class OrdersCronService {
  private database: PrismaDynamicClient;

  constructor(private readonly dbService: DatabaseService) {
    this.initDB();
  }

  private async initDB() {
    this.database = await this.dbService.softDelete();
  }

  async checkOrders(logger: Logger) {
    const clients = await this.database.client.findMany({
      include: {
        orders: true,
      },
    });

    const total_clients = clients.length;
    let count_error = 0;

    logger.debug('Running Cron');

    clients.forEach(async (client, i) => {
      try {
        logger.debug(`Client: ${client.name}`);
        logger.debug(`${i + 1} out of ${total_clients}`);
      } catch (error) {
        logger.error(`Error checking ${client.name}: ${error.message}`);
        count_error++;
      }
    });

    logger.verbose(`Total Clients Found: ${total_clients}`);
    logger.verbose(`Success: ${total_clients - count_error}`);
    logger.error(`Errors: ${count_error}\n`);
  }
}
