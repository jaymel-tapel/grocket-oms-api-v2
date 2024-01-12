import { Injectable } from '@nestjs/common';
import { ResetDto } from '../dto/reset-auth.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { HashService } from './hash.service';

@Injectable()
export class ResetService {
  constructor(
    private readonly database: DatabaseService,
    private readonly hashService: HashService,
  ) {}

  async reset(recovery: ResetDto) {
    const user = await this.database.user.findFirstOrThrow({
      where: { forgot_password_code: recovery.recover_code },
    });

    const newPassword = await this.hashService.hashPassword(recovery.password);

    await this.database.user.update({
      where: { id: user.id },
      data: { forgot_password_code: null, password: newPassword },
    });

    return { message: 'Password successfuly changed' };
  }
}
