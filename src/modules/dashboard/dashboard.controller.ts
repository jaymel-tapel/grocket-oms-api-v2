import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardDateRangeDto } from './dto/date-range.dto';
import { DashboardService } from './service/dashboard.service';
import { JwtGuard } from '@modules/auth/guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminDashboardEntity } from './entity/admin-dashboard.entity';
import { AdminGraphEntity } from './entity/admin-graph.entity';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';

@UseGuards(JwtGuard)
@Controller('dashboard')
@ApiTags('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @ApiQuery({ type: DashboardDateRangeDto, required: false })
  @ApiOkResponse({ type: AdminDashboardEntity })
  async admin(@Query() range?: DashboardDateRangeDto) {
    return await this.dashboardService.admin(range);
  }

  @Get('admin/graph')
  @ApiQuery({ type: DashboardDateRangeDto, required: false })
  @ApiOkResponse({ type: AdminGraphEntity })
  async adminGraph(@Query() range?: DashboardDateRangeDto) {
    return await this.dashboardService.adminGraph(range);
  }

  @Get('seller')
  @ApiQuery({ type: DashboardDateRangeDto, required: false })
  async seller(
    @AuthUser() authUser: UserEntity,
    @Query() range?: DashboardDateRangeDto,
  ) {
    return await this.dashboardService.seller(authUser, range);
  }

  @Get('seller/graph')
  @ApiQuery({ type: DashboardDateRangeDto, required: false })
  async sellerGraph(
    @AuthUser() authUser: UserEntity,
    @Query() range?: DashboardDateRangeDto,
  ) {
    return await this.dashboardService.sellerGraph(authUser, range);
  }
}
