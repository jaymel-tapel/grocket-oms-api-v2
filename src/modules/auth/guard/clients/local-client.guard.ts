import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalClientGuard extends AuthGuard('client') {
  constructor() {
    super();
  }
}
