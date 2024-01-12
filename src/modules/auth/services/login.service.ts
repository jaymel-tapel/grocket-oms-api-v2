import { Injectable } from '@nestjs/common';
import { ValidateUserDto } from '../dto/login-auth.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { HashService } from './hash.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginService {
  constructor(
    private readonly database: DatabaseService,
    private readonly hashService: HashService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.database.user.findFirst({ where: { email } });

    if (
      user &&
      (await this.hashService.comparePassword(password, user.password))
    ) {
      return user;
    }
    return null;
  }

  async login(credential: ValidateUserDto) {
    delete credential.password;
    return {
      ...credential,
      access_token: this.jwt.sign(credential),
    };
  }
}
