import { Body, Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SellersReportService } from './services/sellers-report.service';
import { JwtGuard } from '@modules/auth/guard';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SellerCountEntity } from './entity/seller-count.entity';
import { DateRangeDto } from './dto/date-range.dto';
import { ChartDetailEntity } from './entity/chart-detail.entity';
import { SellersService } from './services/sellers.service';
import { FilterSellersDto } from './dto/filter-seller.dto';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';
import { ApiOffsetPageResponse } from '@modules/offset-page/api-offset-page-response.decorator';
import { SellerEntity } from './entity/seller.entity';
import { SellerReportDto } from './dto/seller-report.dto';

@UseGuards(JwtGuard)
@Controller('sellers')
@ApiTags('sellers')
@ApiBearerAuth()
export class SellersController {
  constructor(
    private readonly sellerReportService: SellersReportService,
    private readonly sellerService: SellersService,
  ) {}

  @Get()
  @ApiOffsetPageResponse(SellerEntity)
  async findAll(
    @Query() findManyArgs: FilterSellersDto,
    @Query() offsetPageArgsDto: OffsetPageArgsDto,
  ) {
    return await this.sellerService.findAll(findManyArgs, offsetPageArgsDto);
  }

  @Get('count')
  @ApiOkResponse({ type: SellerCountEntity })
  async getSellerCount(@Query() data?: SellerReportDto) {
    return await this.sellerReportService.getSellerCount(data);
  }

  @Get('chart')
  @ApiOkResponse({ type: ChartDetailEntity })
  async getChartDetail(@Query() data?: SellerReportDto) {
    return new ChartDetailEntity(
      await this.sellerReportService.getChartDetail(data),
    );
  }
}
