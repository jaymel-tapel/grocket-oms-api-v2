import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AlternateEmailsModule } from './modules/alternate-emails/alternate-emails.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';
import { TasksModule } from './modules/my-tasks/tasks.module';
import { AbilityModule } from './modules/casl/ability.module';
import { Commands } from '@modules/database/seeders';
import { MailerModule } from '@nestjs-modules/mailer';
import { CompaniesModule } from './modules/companies/companies.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BrandsModule } from './modules/brands/brands.module';
import { join } from 'path';
import { EmailModule } from './modules/mail/email.module';
import { ValidatorConstraints } from './common/validators';
import { CustomHandlebarsAdapter } from './common/helpers/handlebars';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { CSVModule } from './common/csv/csv.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: +process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      },
      template: {
        dir: join(__dirname, '..', 'src/templates'),
        adapter: new CustomHandlebarsAdapter(),
        options: {
          strict: true,
        },
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
    OrdersModule,
    SellersModule,
    BrandsModule,
    EmailModule,
    DashboardModule,
    InvoicesModule,
    CSVModule,
  ],
  providers: [...ValidatorConstraints, ...Commands],
})
export class AppModule {}
