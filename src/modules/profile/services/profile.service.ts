import { BadRequestException, Injectable } from '@nestjs/common';
import { AlternateEmailsService } from 'src/modules/alternate-emails/services/alternate-emails.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AlternateEmailEntity } from 'src/modules/alternate-emails/entities/alternate-email.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { CloudinaryService } from '@modules/cloudinary/services/cloudinary.service';
import { extractPublicIdFromUrl } from '../helpers/upload-photo.helper';
import { DatabaseService } from '@modules/database/services/database.service';
import { dd } from '@src/common/helpers/debug';

@Injectable()
export class ProfileService {
  constructor(
    private readonly usersService: UsersService,
    private readonly alternateEmailService: AlternateEmailsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly database: DatabaseService,
  ) {}

  async fetchProfile(id: number) {
    return await this.usersService.findUniqueByCondition({
      where: { id },
      include: {
        alternateEmails: true,
      },
    });
  }

  async updateProfile(id: number, updateProfileDto: UpdateProfileDto) {
    const { alternateEmails, ...data } = updateProfileDto;
    const user = await this.usersService.findUniqueOrThrow(id);
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

  async uploadPhoto(
    authUser: UserEntity,
    image?: Express.Multer.File,
    image_delete?: Boolean,
  ) {
    if (image_delete) {
      return await this.removeProfileImage(authUser);
    } else if (image) {
      return await this.replaceProfileImage(authUser, image);
    }
  }

  private async removeProfileImage(authUser: UserEntity) {
    if (authUser.profile_image) {
      const publicId = extractPublicIdFromUrl(authUser.profile_image);
      // ? Remove the image from Cloudinary using the destroy method
      await this.cloudinaryService.destroyImage(publicId);
    }

    return await this.database.user.update({
      where: { id: authUser.id },
      data: {
        profile_image: null,
      },
    });
  }

  private async replaceProfileImage(
    authUser: UserEntity,
    image: Express.Multer.File,
  ) {
    if (authUser.profile_image) {
      await this.removeProfileImage(authUser);
    }

    // ? Upload the new image to Cloudinary
    const result = await this.cloudinaryService.uploadImage(image).catch(() => {
      throw new BadRequestException('Invalid file type.');
    });

    // ? Update the user's profile_image with the Cloudinary URL
    return await this.database.user.update({
      where: { id: authUser.id },
      data: {
        profile_image: result.secure_url,
      },
    });
  }
}
