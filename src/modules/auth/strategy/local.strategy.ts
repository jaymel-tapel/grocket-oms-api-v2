import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginService } from '../services/login.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private loginService: LoginService) {
    super();
  }

  async validate(username: string, password: string) {
    const user = await this.loginService.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException({
        message: 'You have entered a wrong email or password',
      });
    }

    return user;
  }
}
