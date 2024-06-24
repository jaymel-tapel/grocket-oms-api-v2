import { Module } from '@nestjs/common';
import { DeprecatedCSVService } from './services/csv.service';
import { DeprecatedCSVController } from './csv.controller';
import { MulterModule } from '@nestjs/platform-express';
import { HashService } from '@modules/auth/services/hash.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './public/uploads',
    }),
  ],
  controllers: [DeprecatedCSVController],
  providers: [DeprecatedCSVService, HashService],
})
export class DeprecatedCSVModule {}
