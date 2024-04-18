import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ParticipantsService } from './services/participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { JwtGuard } from '@modules/auth/guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';

@UseGuards(JwtGuard)
@Controller('participants')
@ApiTags('participants')
@ApiBearerAuth()
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  create(@Body() createParticipantDto: CreateParticipantDto) {
    return this.participantsService.create(createParticipantDto);
  }

  // @Get()
  // findAll() {
  //   return this.participantsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.participantsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateParticipantDto: UpdateParticipantDto,
  // ) {
  //   return this.participantsService.update(+id, updateParticipantDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.participantsService.remove(+id);
  // }
}
