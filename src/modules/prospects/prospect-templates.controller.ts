import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProspectTemplatesService } from './services/prospect-templates.service';
import { CreateProspectTemplateDto } from './dto/create-template.dto';
import {
  UpdateProspectTemplateDto,
  UpdateProspectsOrderByDto,
} from './dto/update-template.dto';
import { JwtGuard } from '@modules/auth/guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProspectTemplateEntity } from './entities/prospect-template.entity';

@UseGuards(JwtGuard)
@Controller('templates')
@ApiTags('prospect templates')
@ApiBearerAuth()
export class ProspectTemplatesController {
  constructor(
    private readonly prospectTemplatesService: ProspectTemplatesService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ProspectTemplateEntity })
  async create(@Body() createTemplateDto: CreateProspectTemplateDto) {
    return this.prospectTemplatesService.create(createTemplateDto);
  }

  @Patch(':templateId')
  @ApiOkResponse({ type: ProspectTemplateEntity })
  async update(
    @Param('templateId', ParseIntPipe) id: number,
    @Body() updateProspectTemplateDto: UpdateProspectTemplateDto,
  ) {
    return this.prospectTemplatesService.update(id, updateProspectTemplateDto);
  }

  @Put('position/:templateId')
  @ApiOkResponse({ type: [ProspectTemplateEntity] })
  async updateProspectsPosition(
    @Param('templateId', ParseIntPipe) id: number,
    @Body() orderByDto: UpdateProspectsOrderByDto,
  ) {
    return this.prospectTemplatesService.updateProspectsPosition(
      id,
      orderByDto,
    );
  }

  @Get()
  @ApiOkResponse({ type: [ProspectTemplateEntity] })
  async findAll() {
    const templates = await this.prospectTemplatesService.findAll();
    return templates.map((temp) => new ProspectTemplateEntity(temp));
  }

  @Get(':templateId')
  @ApiOkResponse({ type: ProspectTemplateEntity })
  async findOne(@Param('templateId', ParseIntPipe) id: number) {
    return new ProspectTemplateEntity(
      await this.prospectTemplatesService.findUnique(id),
    );
  }
}
