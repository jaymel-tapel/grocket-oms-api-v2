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
import { ProspectSessionService } from './services/prospect-session.service';
import { ProspectSessionEntity } from './entities/prospect-session.entity';
import {
  FilterSessionManyOptions,
  FilterSessionOptions,
} from './dto/filter-session.dto';

@UseGuards(JwtGuard)
@Controller('session')
@ApiTags('prospect session')
@ApiBearerAuth()
export class ProspectSessionController {
  constructor(
    private readonly prospectSessionService: ProspectSessionService,
  ) {}

  @Get(':id')
  @ApiOkResponse({ type: ProspectSessionEntity })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() filterOpts: FilterSessionOptions,
  ) {
    const session = await this.prospectSessionService.findOne(
      {
        where: { id },
        include: { prospects: true },
      },
      filterOpts,
    );
    return new ProspectSessionEntity(session);
  }

  @Get()
  @ApiOkResponse({ type: [ProspectSessionEntity] })
  async findMany(@Query() filterOpts: FilterSessionManyOptions) {
    const sessions = await this.prospectSessionService.findMany(
      {
        include: { prospects: true },
      },
      filterOpts,
    );
    return sessions.map((session) => new ProspectSessionEntity(session));
  }
}
