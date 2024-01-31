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
import { SellerCountDto } from './dto/seller-count.dto';

@UseGuards(JwtGuard)
@Controller('sellers')
@ApiTags('sellers')
@ApiBearerAuth()
export class SellersController {
  constructor(private readonly sellerService: SellersService) {}

  @Get('count')
  @ApiOkResponse({ type: SellerCountEntity })
  async getSellerCount(@Body() data: SellerCountDto) {
    return this.sellerService.getSellerCount(data);
  }

  @Get('chart')
  @ApiBody({ type: ChartDto })
  async getChartDetail(@Body() data: ChartDto) {
    return await this.sellerService.getChartDetail(data);
  }
}
