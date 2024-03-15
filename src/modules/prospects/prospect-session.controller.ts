import { JwtGuard } from '@modules/auth/guard';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProspectSessionService } from './services/prospect-session.service';
import { FilterSessionDto } from './dto/filter-session.dto';
import { ProspectSessionEntity } from './entities/prospect-session.entity';

@UseGuards(JwtGuard)
@Controller('session')
@ApiTags('session')
@ApiBearerAuth()
export class ProspectSessionController {
  constructor(
    private readonly prospectSessionService: ProspectSessionService,
  ) {}

  @Get()
  @ApiOkResponse({ type: ProspectSessionEntity })
  async findOne(@Query() filterArgs: FilterSessionDto) {
    const session = await this.prospectSessionService.findOne({
      where: { id: filterArgs.id },
      include: { prospects: true },
    });
    return new ProspectSessionEntity(session);
  }
}
