import { Module } from '@nestjs/common';
import { CSVService } from './services/csv.service';
import { CSVController } from './csv.controller';
import { MulterModule } from '@nestjs/platform-express';
import { HashService } from '@modules/auth/services/hash.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './public/uploads',
    }),
  ],
  controllers: [CSVController],
  providers: [CSVService, HashService],
})
export class DeprecatedCSVModule {}
