import { DatabaseService } from '@modules/database/services/database.service';
import { Prisma } from '@prisma/client';
import { Command, CommandRunner } from 'nest-commander';

@Command({
  name: 'dummy:prospect',
})
export class ProspectsDummyDataCommand extends CommandRunner {
  constructor(private readonly database: DatabaseService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const lastProspect = await this.database.prospect.findFirst({
      where: { templateId: 1 },
      select: { id: true, position: true },
      orderBy: { position: 'desc' },
    });

    const dummyData = Array.from(
      { length: 1000 },
      (_, index): Prisma.ProspectCreateWithoutSessionInput => ({
        name: `user${++index}`,
        position: ++lastProspect.position,
      }),
    );

    await this.database.prospectSession.create({
      data: {
        prospects: {
          create: dummyData,
        },
      },
    });

    console.log(`SUCCESS!`);
  }
}
