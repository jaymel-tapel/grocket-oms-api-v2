import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SellersService } from './services/sellers.service';
import { JwtGuard } from '@modules/auth/guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SellerCountEntity } from './entity/seller-count.entity';
import { DateRangeDto } from './dto/date-range.dto';
import { ChartDetailEntity } from './entity/chart-detail.entity';

@UseGuards(JwtGuard)
@Controller('sellers')
@ApiTags('sellers')
@ApiBearerAuth()
export class SellersController {
  constructor(private readonly sellerService: SellersService) {}

  @Get('count')
  @ApiOkResponse({ type: SellerCountEntity })
  @ApiBody({ type: DateRangeDto, required: false })
  async getSellerCount(@Body() data?: DateRangeDto) {
    return await this.sellerService.getSellerCount(data);
  }

  @Get('chart')
  @ApiOkResponse({ type: ChartDetailEntity })
  @ApiBody({ type: DateRangeDto, required: false })
  async getChartDetail(@Body() data?: DateRangeDto) {
    return new ChartDetailEntity(await this.sellerService.getChartDetail(data));
  }
}
