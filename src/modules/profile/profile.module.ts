import { Module } from '@nestjs/common';
import { ProfileService } from './services/profile.service';
import { ProfileController } from './profile.controller';
import { UsersModule } from '../users/users.module';
import { AlternateEmailsModule } from '../alternate-emails/alternate-emails.module';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';

@Module({
  imports: [UsersModule, AlternateEmailsModule, CloudinaryModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
