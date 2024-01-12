import { Module } from '@nestjs/common';
import { LoginService } from './services/login.service';
import { AuthController } from './auth.controller';
import { HashService } from './services/hash.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';
import { ForgotService } from './services/forgot.service';
import { ResetService } from './services/reset.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { LocalStrategy } from './strategy/local.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MailerModule.forRoot({
      transport: {
        host: '0.0.0.0',
        port: 1025,
      },
      defaults: {
        from: 'admin@example.com',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginService,
    HashService,
    ForgotService,
    ResetService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [LoginService, HashService, ForgotService, ResetService],
})
export class AuthModule {}
