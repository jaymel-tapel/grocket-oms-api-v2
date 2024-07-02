import { Module } from '@nestjs/common';
import { CsvController } from './csv.controller';
import { CsvService } from './services/csv.service';
import { ClientsModule } from '@modules/clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [CsvController],
  providers: [CsvService],
})
export class CsvModule {}
