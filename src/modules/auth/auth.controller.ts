import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LoginService as LoginService } from './services/login.service';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LoginEntity } from './entities/login.entity';
import { ForgotPasswordDto } from './dto/forgot-auth.dto';
import { ForgotService } from './services/forgot.service';
import { ResetDto } from './dto/reset-auth.dto';
import { ResetService } from './services/reset.service';
import { LocalGuard } from './guard/local.guard';
import { LoginDto } from './dto/login-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginService: LoginService,
    private readonly forgotService: ForgotService,
    private readonly resetService: ResetService,
  ) {}

  @Post('login')
  @UseGuards(LocalGuard)
  @ApiOkResponse({ type: LoginEntity })
  @ApiBody({ type: LoginDto })
  async login(@Req() req: any) {
    return await this.loginService.login(req.user);
  }

  @Post('forgot')
  @ApiBody({ type: ForgotPasswordDto })
  async forgot(@Body() credential: ForgotPasswordDto) {
    return await this.forgotService.forgot(credential);
  }

  @Post('reset')
  @ApiBody({ type: ResetDto })
  async reset(@Body() recovery: ResetDto) {
    return await this.resetService.reset(recovery);
  }
}
