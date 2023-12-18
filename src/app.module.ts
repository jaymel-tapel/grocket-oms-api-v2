import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AlternateEmailsModule } from './modules/alternate-emails/alternate-emails.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    AlternateEmailsModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
