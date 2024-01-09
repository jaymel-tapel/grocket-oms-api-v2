import { Module } from '@nestjs/common';
import { AuthService } from './services/login.service';
import { AuthController } from './auth.controller';
import { HashService } from './services/hash.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, HashService, JwtStrategy],
  exports: [AuthService, HashService],
})
export class AuthModule {}
