import { Body, Controller, Post } from '@nestjs/common';
import { AuthService as LoginService } from './services/login.service';
import { LoginDto } from './dto/login-auth.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LoginEntity } from './entities/login.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  @ApiOkResponse({ type: LoginEntity })
  async login(@Body() credential: LoginDto) {
    return await this.loginService.login(credential);
  }
}
