import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ProspectsService } from './services/prospects.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';
import { JwtGuard } from '@modules/auth/guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProspectTemplatesService } from './services/prospect-templates.service';
import { ProspectSendMailService } from './services/prospect-send-email.service';
import { ProspectEntity } from './entities/prospect.entity';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';
import { SendManualEmailProspectDto } from './dto/send-email-prospect.dto';
import { ProspectSessionEntity } from './entities/prospect-session.entity';
import { CreateProspectSession } from './dto/create-prospect-session.dto';
import { ProspectSessionService } from './services/prospect-session.service';

@UseGuards(JwtGuard)
@Controller('prospects')
@ApiTags('prospects')
@ApiBearerAuth()
export class ProspectsController {
  constructor(
    private readonly prospectsService: ProspectsService,
    private readonly prospectSessionService: ProspectSessionService,
    private readonly prospectTemplatesService: ProspectTemplatesService,
    private readonly prospectSendMailService: ProspectSendMailService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ProspectSessionEntity })
  async create(
    @AuthUser() user: UserEntity,
    @Body() createProspectSessionDto: CreateProspectSession,
  ) {
    return new ProspectSessionEntity(
      await this.prospectSessionService.create(createProspectSessionDto, user),
    );
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProspectEntity })
  async update(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProspectDto: UpdateProspectDto,
  ) {
    return this.prospectsService.update(id, user, updateProspectDto);
  }

  @Get('send-email/:id')
  async sendEmail(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const prospect = await this.prospectsService.findOneOrThrow({
      where: { id },
      include: { prospectTemplate: true },
    });
    return await this.prospectSendMailService.send(
      new ProspectEntity(prospect),
      user,
    );
  }

  @Post('send-email/manual/:id')
  async sendEmailManual(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() { templateId }: SendManualEmailProspectDto,
  ) {
    const prospect = await this.prospectsService.findOneOrThrow({
      where: { id },
    });

    const template = await this.prospectTemplatesService.findOneOrThrow({
      where: { id: templateId },
    });

    return await this.prospectSendMailService.manualSend(
      new ProspectEntity(prospect),
      template,
      user,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: ProspectEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.prospectsService.findUnique(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.prospectsService.remove(id);
  }
}
