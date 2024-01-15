import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AlternateEmailsModule } from './modules/alternate-emails/alternate-emails.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ClientsModule } from './modules/clients/clients.module';
import { DoesExistConstraint } from './common/validators/user.validation';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';
import { TasksModule } from './modules/my-tasks/tasks.module';
import { AbilityModule } from './modules/casl/ability.module';
import { Commands } from '@modules/database/seeders';
import { MailerModule } from '@nestjs-modules/mailer';
import { CompaniesModule } from './modules/companies/companies.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT, 10),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.MAIL_SENDER}>`,
      },
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    AlternateEmailsModule,
    ProfileModule,
    ClientsModule,
    CloudinaryModule,
    TasksModule,
    AbilityModule,
    CompaniesModule,
  ],
  controllers: [],
  providers: [DoesExistConstraint, ...Commands],
})
export class AppModule {}
