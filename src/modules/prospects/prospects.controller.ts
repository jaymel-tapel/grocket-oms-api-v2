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
  Query,
} from '@nestjs/common';
import { ProspectsService } from './services/prospects.service';
import { UpdateProspectDto } from './dto/update-prospect.dto';
import { JwtGuard } from '@modules/auth/guard';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProspectTemplatesService } from './services/prospect-templates.service';
import { ProspectSendMailService } from './services/prospect-send-email.service';
import { ProspectEntity } from './entities/prospect.entity';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';
import { SendManualEmailProspectDto } from './dto/send-email-prospect.dto';
import { FilterProspectDto } from './dto/filter-prospect.dto';

@UseGuards(JwtGuard)
@Controller('prospects')
@ApiTags('prospects')
@ApiBearerAuth()
export class ProspectsController {
  constructor(
    private readonly prospectsService: ProspectsService,
    private readonly prospectTemplatesService: ProspectTemplatesService,
    private readonly prospectSendMailService: ProspectSendMailService,
  ) {}

  @Patch(':id')
  @ApiOkResponse({ type: ProspectEntity })
  async update(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProspectDto: UpdateProspectDto,
  ) {
    return this.prospectsService.update(id, updateProspectDto, user);
  }

  @Get()
  @ApiOkResponse({ type: [ProspectEntity] })
  async findAll(@Query() filterProspects: FilterProspectDto) {
    return this.prospectsService.findAll(filterProspects);
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
