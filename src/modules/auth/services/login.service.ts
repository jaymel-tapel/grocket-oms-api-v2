import { ForbiddenException, Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/login-auth.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { HashService } from './hash.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@modules/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly hashService: HashService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(credential: LoginDto) {
    const user = await this.database.user.findFirstOrThrow({
      where: { email: credential.email },
    });

    const passwordCheck = await this.hashService.comparePassword(
      credential.password,
      user.password,
    );

    if (!passwordCheck) throw new ForbiddenException('Credentials incorrect');

    delete user.password;
    return await this.signToken(user);
  }

  async signToken(user: UserEntity): Promise<{ access_token: string }> {
    const payload = { user };

    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
