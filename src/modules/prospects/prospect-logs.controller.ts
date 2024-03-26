import { JwtGuard } from '@modules/auth/guard';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProspectLogsService } from './services/prospect-logs.service';
import { ProspectLogsEntity } from './entities/prospect-log.entity';
import { FilterProspectLogDto } from './dto/filter-prospect-log.dto';

@UseGuards(JwtGuard)
@Controller('prospect-logs')
@ApiTags('prospect logs')
@ApiBearerAuth()
export class ProspectLogsController {
  constructor(private readonly prospectLogsService: ProspectLogsService) {}

  @Get(':prospectId')
  @ApiOkResponse({ type: [ProspectLogsEntity] })
  async index(
    @Param('prospectId', ParseIntPipe) id: number,
    @Query() filterLogs: FilterProspectLogDto,
  ) {
    const prospectLogs = filterLogs.fetchAll
      ? await this.prospectLogsService.findAll({
          where: { id },
        })
      : await this.prospectLogsService.findAllStatusAndEmailOnly({
          where: { id },
        });

    return prospectLogs.map((log) => new ProspectLogsEntity(log));
  }
}
