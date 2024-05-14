import { DatabaseService } from '@modules/database/services/database.service';
import { Logger } from '@nestjs/common';
import { round } from 'lodash';
import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'fix:ratings',
})
export class FixRatingsCommand extends CommandRunner {
  constructor(
    private readonly database: DatabaseService,
    private readonly logger: Logger,
  ) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const dailyRatings = await this.database.dailyRating.findMany({
      where: {
        date: {
          gte: new Date('2024-03-04'),
          lte: new Date('2024-03-28'),
        },
      },
    });

    const batchSize = 100;

    for (let i = 0; i < dailyRatings.length; i += batchSize) {
      const batch = dailyRatings.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (dr) => {
          try {
            this.logger.debug(`Updating Rating ID: ${dr?.id}`);
            console.log(``);

            const stars = dr.stars;

            const weightedSum =
              stars[0] * 5 +
              stars[1] * 4 +
              stars[2] * 3 +
              stars[3] * 2 +
              stars[4] * 1;

            const averageRating = weightedSum / dr.reviews;

            await this.database.dailyRating.update({
              where: { id: dr.id },
              data: {
                rating: round(averageRating, 1),
              },
            });
          } catch (error) {
            this.logger.error(
              `Error Updating Daily Rating ID: ${dr?.id}: ${error}`,
            );
            console.log(``);
          }
        }),
      );
    }

    this.logger.verbose(`Success!`);
  }
}
