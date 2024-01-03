import { DatabaseService } from '@modules/database/services/database.service';
import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'client-source-seed',
})
export class ClientSourceCommand extends CommandRunner {
  constructor(private readonly database: DatabaseService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const industries = [
      'Existing Customer',
      'New Customer (Mail)',
      'New Customer (Phone)',
      'Ads (Insta, Google, etc.)',
      'Other',
    ];

    // ? Get all existing industry names
    const existingIndustryNames = (
      await this.database.clientSource.findMany({ select: { name: true } })
    ).map((industry) => industry.name);

    // ? Filter out existing industry names from the seeder
    const newIndustries = industries.filter(
      (industry) => !existingIndustryNames.includes(industry),
    );

    // ? Prepare the data for insertion
    const dataToInsert = newIndustries.map((name) => ({
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // ? Insert the new industry data into the database
    await this.database.clientSource.createMany({ data: dataToInsert });
  }
}
