import { Command, CommandRunner } from 'nest-commander';
import { DatabaseService } from '../services/database.service';

@Command({
  name: 'client-industry-seed',
})
export class ClientIndustryCommand extends CommandRunner {
  constructor(private readonly database: DatabaseService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const industries = [
      'Autohaus',
      'Restaurant',
      'Hotel',
      'Zahnarzt',
      'Tierarzt',
      'Arzt',
      'Steuerberater',
      'Bestattungen',
      'Apotheke',
      'Immobilienmakler',
      'Supermarkt',
      'Friseur',
      'Kosmetikstudio',
      'Massage',
      'Bar',
      'Tierbedarf',
      'Tattoo',
      'Dachdecker',
      'Solaranlagen',
      'Garten- Landschaftsbau',
      'Campingplatz',
      'Reiterhof',
      'Schneider',
      'Atelier',
      'Blumengeschäft',
      'Spielwarengeschäft',
      'Copy shop',
      'Juwelier',
      'Event-Catering-Dienstleistungen',
      'Unterrichten',
      'Privatermittlung',
      'Fitnessstudio',
      'Haus- und Büroreinigung',
      'Umweltfreundlicher Produkthandel',
      'Digitales Marketing',
      'Finanzdienstleistungen',
      'Professionelles Training',
      'Kindertagesstätte',
      'Wäscherei',
      'Other',
      'Anwalt',
      'Cafe',
      'Notar',
    ];

    // Get all existing industry names
    const existingIndustryNames = await this.database.clientIndustry.findMany({
      select: { name: true },
    });

    // Filter out existing industry names from the seeder
    const newIndustries = industries.filter(
      (name) =>
        !existingIndustryNames.some((industry) => industry.name === name),
    );

    // Prepare the data for insertion
    const dataToInsert = newIndustries.map((name) => ({
      name,
    }));

    // Insert the new industry data into the database
    await this.database.clientIndustry.createMany({
      data: dataToInsert,
    });

    console.log('Success!');
  }
}
