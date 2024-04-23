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
import { WebsocketModule } from '@modules/websocket-gateways/websocket.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
    }),
    WebsocketModule,
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
