import { UsersService } from '@modules/users/services/users.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJWTGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client: Socket = context.switchToWs().getClient();

    const bearerToken = client.handshake.headers.authorization.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(bearerToken, {
        secret: process.env.JWT_SECRET,
      });

      return decoded;
    } catch (error) {
      throw new WsException(error);
    }
  }
}
