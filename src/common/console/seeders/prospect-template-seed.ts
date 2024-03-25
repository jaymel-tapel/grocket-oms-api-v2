import { DatabaseService } from '@modules/database/services/database.service';
import { Prisma } from '@prisma/client';
import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'prospect-template-seed',
})
export class ProspectTemplateCommand extends CommandRunner {
  constructor(private readonly database: DatabaseService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const templates = ['New', 'Cold Email', 'Follow Up 1', 'Follow Up 2'];

    // ? Get all existing template names
    const existingTemplates = (
      await this.database.prospectTemplate.findMany({ select: { name: true } })
    ).map((template) => template.name);

    // ? Filter out existing template names from the seeder
    const newTemplates = templates.filter(
      (template) => !existingTemplates.includes(template),
    );

    // ? Prepare the data for insertion
    const dataToInsert: Prisma.ProspectTemplateCreateManyInput[] =
      newTemplates.map((name) => ({
        name,
        subject: name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    // ? Insert the new industry data into the database
    await this.database.prospectTemplate.createMany({ data: dataToInsert });
  }
}
