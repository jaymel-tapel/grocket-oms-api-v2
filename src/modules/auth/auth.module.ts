import { Module } from '@nestjs/common';
import { LoginService } from './services/login.service';
import { AuthController } from './auth.controller';
import { HashService } from './services/hash.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';
import { ForgotService } from './services/forgot.service';
import { ResetService } from './services/reset.service';
import { LocalStrategy } from './strategy/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalClientStrategy } from './strategy/clients/local-client.strategy';
import { JwtClientStrategy } from './strategy/clients/jwt-client.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
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
    JwtClientStrategy,
    LocalClientStrategy,
  ],
  exports: [LoginService, HashService, ForgotService, ResetService],
})
export class AuthModule {}
