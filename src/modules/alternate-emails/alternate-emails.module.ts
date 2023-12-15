import { Module } from '@nestjs/common';
import { AlternateEmailsService } from './services/alternate-emails.service';
import { AlternateEmailsController } from './alternate-emails.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AlternateEmailsController],
  providers: [AlternateEmailsService],
  exports: [AlternateEmailsService],
})
export class AlternateEmailsModule {}
