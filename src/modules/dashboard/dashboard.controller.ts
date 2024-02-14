import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { DateRangeDto } from './dto/date-range.dto';
import { DashboardService } from './service/dashboard.service';
import { JwtGuard } from '@modules/auth/guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminDashboardEntity } from './entity/admin-dashboard.entity';
import { AdminGraphEntity } from './entity/admin-graph.entity';

@UseGuards(JwtGuard)
@Controller('dashboard')
@ApiTags('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @ApiOkResponse({ type: AdminDashboardEntity })
  @ApiBody({ type: DateRangeDto, required: false })
  async admin(@Body() range?: DateRangeDto) {
    return await this.dashboardService.admin(range);
  }

  @Get('admin/graph')
  @ApiOkResponse({ type: AdminGraphEntity })
  @ApiBody({ type: DateRangeDto, required: false })
  async adminGraph(@Body() range?: DateRangeDto) {
    return await this.dashboardService.adminGraph(range);
  }

  @Get('seller')
  @ApiBody({ type: DateRangeDto, required: false })
  async seller(@Body() range?: DateRangeDto) {
    return await this.dashboardService.seller(range);
  }

  @Get('seller/graph')
  @ApiBody({ type: DateRangeDto, required: false })
  async sellerGraph(@Body() range?: DateRangeDto) {
    return await this.dashboardService.sellerGraph(range);
  }
}
