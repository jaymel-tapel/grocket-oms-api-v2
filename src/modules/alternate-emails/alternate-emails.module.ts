import { Module } from '@nestjs/common';
import { AlternateEmailsService } from './services/alternate-emails.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AlternateEmailsService],
  exports: [AlternateEmailsService],
})
export class AlternateEmailsModule {}
