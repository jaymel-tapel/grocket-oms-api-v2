import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EmailService } from './services/email.service';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';
import { SendEmailByTemplateDto } from '@modules/mail/dto/send-email-by-template.dto';
import { JwtGuard } from '@modules/auth/guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@ApiTags('email')
@Controller('email')
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('order/send-email/:id')
  async sendEmailByTemplate(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() sendEmailDto: SendEmailByTemplateDto,
  ) {
    return await this.emailService.sendEmailByTemplate(id, sendEmailDto, user);
  }
}
