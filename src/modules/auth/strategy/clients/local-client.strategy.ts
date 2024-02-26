import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginService } from '../../services/login.service';
import { ClientEntity } from '@modules/clients/entities/client.entity';

@Injectable()
export class LocalClientStrategy extends PassportStrategy(Strategy, 'client') {
  constructor(private loginService: LoginService) {
    super();
  }

  async validate(username: string, password: string) {
    const client = await this.loginService.validateClient(username, password);

    if (!client) {
      throw new UnauthorizedException({
        message: 'You have entered a wrong email or password',
      });
    }

    return new ClientEntity(client);
  }
}
