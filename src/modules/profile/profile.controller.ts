import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './services/profile.service';
import { ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { UsersService } from '@modules/users/services/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from './pipes/file-validation.pipe';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly usersService: UsersService,
  ) {}

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  async getProfile(@Param('id', ParseIntPipe) id: number) {
    return new UserEntity(await this.profileService.fetchProfile(id));
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return new UserEntity(
      await this.profileService.updateProfile(id, updateProfileDto),
    );
  }

  @Post('upload/:id')
  @ApiOkResponse({ type: UserEntity })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async profilePhoto(
    @Param('id', ParseIntPipe) id: number,
    @Body() { image_delete }: UploadPhotoDto,
    @UploadedFile(new FileValidationPipe())
    image?: Express.Multer.File | null,
  ) {
    const user = await this.usersService.findUniqueOrThrow(id);
    return new UserEntity(
      await this.profileService.uploadPhoto(user, image, image_delete),
    );
  }
}
