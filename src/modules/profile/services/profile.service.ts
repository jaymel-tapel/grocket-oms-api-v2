import { Injectable } from '@nestjs/common';
import { AlternateEmailsService } from 'src/modules/alternate-emails/services/alternate-emails.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AlternateEmailEntity } from 'src/modules/alternate-emails/entities/alternate-email.entity';

@Injectable()
export class ProfileService {
  constructor(
    private readonly usersService: UsersService,
    private readonly alternateEmailService: AlternateEmailsService,
  ) {}

  async fetchProfile(id: number) {
    return await this.usersService.findByCondition({
      where: { id },
      include: {
        alternateEmails: true,
      },
    });
  }

  async updateProfile(id: number, updateProfileDto: UpdateProfileDto) {
    const { alternateEmails, ...data } = updateProfileDto;
    const user = await this.usersService.findOne(id);
    let alternateResult: AlternateEmailEntity[] =
      await this.alternateEmailService.findAllByCondition({
        where: { userId: user.id },
      });

    await this.usersService.update(user.id, { ...data });

    if (alternateEmails) {
      alternateResult = await this.alternateEmailService.upsert(
        user,
        alternateEmails,
      );
    }

    const result = {
      ...user,
      alternateEmails: alternateResult,
    };

    return result;
  }
}
