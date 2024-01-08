import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AlternateEmailsModule } from './modules/alternate-emails/alternate-emails.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ClientsModule } from './modules/clients/clients.module';
import { DoesExistConstraint } from './common/validators/user.validation';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    AlternateEmailsModule,
    ProfileModule,
    ClientsModule,
    CloudinaryModule,
  ],
  controllers: [],
  providers: [DoesExistConstraint],
})
export class AppModule {}
