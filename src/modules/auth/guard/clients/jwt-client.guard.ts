import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtClientGuard extends AuthGuard('client') {
  constructor() {
    super();
  }
}
