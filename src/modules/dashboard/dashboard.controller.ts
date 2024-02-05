import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { DateRangeDto } from './dto/date-range.dto';
import { DashboardService } from './service/dashboard.service';
import { JwtGuard } from '@modules/auth/guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@Controller('dashboard')
@ApiTags('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  async orders(@Body() range?: DateRangeDto) {
    return await this.dashboardService.admin(range);
  }
}
