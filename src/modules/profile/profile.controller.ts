import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './services/profile.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  SimplifiedUserEntity,
  UserEntity,
} from '../users/entities/user.entity';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { UsersService } from '@modules/users/services/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { JwtGuard } from '@modules/auth/guard';
import { InjectUserToBody } from '@src/common/decorators/inject-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@UseGuards(JwtGuard)
@ApiTags('profile')
@Controller('profile')
@ApiBearerAuth()
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOkResponse({ type: UserEntity })
  async getProfile(@AuthUser() authUser: UserEntity) {
    return new UserEntity(await this.profileService.fetchProfile(authUser.id));
  }

  @Patch('change-password')
  @ApiOkResponse({ type: SimplifiedUserEntity })
  async changePass(
    @AuthUser() authUser: UserEntity,
    @Body() changePassDto: ChangePasswordDto,
  ) {
    return new UserEntity(
      await this.profileService.changePassword(authUser, changePassDto),
    );
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserEntity })
  @InjectUserToBody()
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
