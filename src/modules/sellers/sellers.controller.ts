import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SellersService } from './services/sellers.service';
import { JwtGuard } from '@modules/auth/guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChartDto } from './dto/chart.dto';
import { SellerCountEntity } from './entity/seller-count.dto';
import { SellerVolatilityEntity } from './entity/seller-volatility.dto';

@UseGuards(JwtGuard)
@Controller('sellers')
@ApiTags('sellers')
@ApiBearerAuth()
export class SellersController {
  constructor(private readonly sellerService: SellersService) {}

  @Get('count')
  @ApiOkResponse({ type: SellerCountEntity })
  async getSellerCount() {
    return this.sellerService.getSellerCount();
  }

  @Get('volatility')
  @ApiOkResponse({ type: SellerVolatilityEntity })
  async getVolatility() {
    return await this.sellerService.getVolatility();
  }

  @Get('chart')
  @ApiBody({ type: ChartDto })
  async getChartDetail(@Body() data: ChartDto) {
    return await this.sellerService.getChartDetail(data);
  }
}
