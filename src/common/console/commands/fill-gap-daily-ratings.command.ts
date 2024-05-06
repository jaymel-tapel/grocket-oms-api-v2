import { DatabaseService } from '@modules/database/services/database.service';
import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'fill:daily-ratings',
})
export class FillGapDailyRatingsCommand extends CommandRunner {
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
    const database = await this.database.softDelete();

    const companies = await database.company.findMany({
      orderBy: { createdAt: 'asc' },
    });

    for (const company of companies) {
      this.logger.debug(`Updating Company ID: ${company.id}`);
      this.logger.debug(`Updating Company Name: ${company.name}`);
      console.log(``);

      const daily_ratings = await database.dailyRating.findMany({
        where: { companyId: company.id },
        orderBy: { date: 'desc' },
      });

      let currentDate =
        daily_ratings?.length > 0
          ? new Date(daily_ratings[0].date)
          : new Date('2024-05-02');

      for (let i = 0; i < daily_ratings?.length - 1; i++) {
        const currentRating = daily_ratings[i];
        const nextRating = daily_ratings[i + 1];

        const nextDate = nextRating.date;

        currentDate.setUTCHours(0, 0, 0, 0);
        nextDate.setUTCHours(0, 0, 0, 0);

        while (currentDate > nextDate) {
          currentDate.setDate(currentDate.getDate() - 1);

          const doesExist = nextDate >= currentDate;

          if (!doesExist) {
            const newRating: Prisma.DailyRatingCreateInput = {
              company: { connect: { id: currentRating.companyId } },
              date: currentDate,
              rating: currentRating.rating,
              reviews: currentRating.reviews,
              negative_reviews: currentRating.negative_reviews,
              stars: currentRating.stars,
            };

            await database.dailyRating.create({
              data: newRating,
            });
          }
        }

        currentDate = new Date(nextDate);
      }
    }

    this.logger.verbose(`Success!`);
  }
}
