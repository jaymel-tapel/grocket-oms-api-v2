import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AlternateEmailsService } from './services/alternate-emails.service';
import { CreateAlternateEmailDto } from './dto/create-alternate-email.dto';
import { UpdateAlternateEmailDto } from './dto/update-alternate-email.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AlternateEmailEntity } from './entities/alternate-email.entity';
import { FindAlternateDto } from './dto/find-alternate-email.dto';

@ApiTags('alternate-emails')
@Controller('alternate-emails')
export class AlternateEmailsController {
  constructor(
    private readonly alternateEmailsService: AlternateEmailsService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: AlternateEmailEntity })
  async create(@Body() createAlternateEmailDto: CreateAlternateEmailDto) {
    return new AlternateEmailEntity(
      await this.alternateEmailsService.create(createAlternateEmailDto),
    );
  }

  @Get()
  @ApiOkResponse({ type: AlternateEmailEntity, isArray: true })
  async findAll(@Query() query: FindAlternateDto) {
    const users = await this.alternateEmailsService.findAll(query);
    return users.map((user) => new AlternateEmailEntity(user));
  }

  @Get(':id')
  @ApiOkResponse({ type: AlternateEmailEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return new AlternateEmailEntity(
      await this.alternateEmailsService.findOne(id),
    );
  }

  @Patch(':id')
  @ApiOkResponse({ type: AlternateEmailEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAlternateEmailDto: UpdateAlternateEmailDto,
  ) {
    return new AlternateEmailEntity(
      await this.alternateEmailsService.update(id, updateAlternateEmailDto),
    );
  }

  @Delete(':id')
  @ApiOkResponse({ type: AlternateEmailEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.alternateEmailsService.remove(id);
  }
}
