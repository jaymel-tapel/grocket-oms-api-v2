import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ProfileService } from './services/profile.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

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
}
