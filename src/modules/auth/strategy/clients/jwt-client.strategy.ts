import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ValidateClientDto } from '../../dto/login-auth.dto';

@Injectable()
export class JwtClientStrategy extends PassportStrategy(Strategy, 'client') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: ValidateClientDto) {
    return payload;
  }
}
