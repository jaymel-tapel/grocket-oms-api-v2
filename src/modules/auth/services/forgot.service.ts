import { Injectable } from '@nestjs/common';
import { ForgotPasswordDto } from '../dto/forgot-auth.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { MailerService } from '@nestjs-modules/mailer';
import { HashService } from './hash.service';

@Injectable()
export class ForgotService {
  constructor(
    private readonly database: DatabaseService,
    private readonly mailerService: MailerService,
    private readonly hashService: HashService,
  ) {}

  async forgot(credential: ForgotPasswordDto) {
    const user = await this.database.user.findFirstOrThrow({
      where: { email: credential.email },
    });

    const forgot_password_code = await this.hashService.generatePasswordToken();

    await this.database.user.update({
      where: { id: user.id },
      data: { forgot_password_code },
    });

    const link = process.env.RESET_ROUTE + `?token=${forgot_password_code}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Password Reset`,
      html: `<p>Hi ${user.name},</p>
      <p>We received a request to reset your password.</p>
      <p>Here is your password reset code</p>
      <a href='${link}'>Click Here</a>`,
    });

    return { message: 'Reset code sent to email' };
  }
}
