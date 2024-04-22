import { Injectable } from '@nestjs/common';
import { ValidateClientDto, ValidateUserDto } from '../dto/login-auth.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { HashService } from './hash.service';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain } from 'class-transformer';
import { User } from '@prisma/client';

@Injectable()
export class LoginService {
  constructor(
    private readonly database: DatabaseService,
    private readonly hashService: HashService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const database = await this.database.softDelete();

    const alternateEmail = await database.alternateEmail.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    let user: User;

    if (alternateEmail) {
      user = await database.user.findFirst({
        where: { id: alternateEmail.userId },
      });
    } else {
      user = await database.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
      });
    }

    if (
      user &&
      (await this.hashService.comparePassword(password, user.password))
    ) {
      return user;
    }

    return null;
  }

  async validateClient(email: string, password: string): Promise<any> {
    const client = await this.database.client.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      include: { clientInfo: true },
    });

    if (
      client &&
      (await this.hashService.comparePassword(password, client.password))
    ) {
      return client;
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

  async loginClient(credential: ValidateClientDto) {
    let convertedCredential = instanceToPlain(credential);
    return {
      ...convertedCredential,
      access_token: this.jwt.sign(convertedCredential),
    };
  }
}
