import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { HashService } from './services/hash.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, HashService],
  exports: [AuthService, HashService],
})
export class AuthModule {}
