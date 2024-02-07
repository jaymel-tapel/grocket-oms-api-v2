import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import {
  CreateOrderClientDto,
  CreateOrderDto,
  CreateOrderEntity,
} from './dto/create-order.dto';
import {
  UpdateOrderClientInfoDto,
  UpdateOrderCombinedEntity,
  UpdateOrderDto,
} from './dto/update-order.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderEntity } from './entities/order.entity';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';
import { JwtGuard } from '@modules/auth/guard';
import { FilterOrderDto } from './dto/filter-order.dto';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';
import { ApiOffsetPageResponse } from '@modules/offset-page/api-offset-page-response.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from '@modules/profile/pipes/file-validation.pipe';
import { UploadPhotoDto } from '@modules/profile/dto/upload-photo.dto';
import { OrderReportDateRangeDto } from './dto/get-order-report.dto';
import { OrderReportsService } from './services/order-reports.service';
import { OrderGraphEntity } from './entities/order-graph.entity';
import { OrderReportEntity } from './entities/order-report.entity';

@UseGuards(JwtGuard)
@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderReportsService: OrderReportsService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: OrderEntity })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateOrderEntity })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @AuthUser() user: UserEntity,
    @Body() createOrderDto: CreateOrderDto,
    @Body() createOrderClientDto: CreateOrderClientDto,
    @UploadedFile(new FileValidationPipe()) file?: Express.Multer.File | null,
  ) {
    const newOrder = await this.ordersService.create(
      user,
      { file, ...createOrderDto },
      createOrderClientDto,
    );
    return new OrderEntity(newOrder);
  }

  @Get()
  @ApiOffsetPageResponse(OrderEntity)
  async findAll(
    @AuthUser() user: UserEntity,
    @Query() findManyArgs: FilterOrderDto,
    @Query() offsetPageArgsDto: OffsetPageArgsDto,
  ) {
    return await this.ordersService.findAllWithPagination(
      user,
      findManyArgs,
      offsetPageArgsDto,
    );
  }

  @Get('deleted')
  @ApiOffsetPageResponse(OrderEntity)
  async findAllDeleted(
    @AuthUser() user: UserEntity,
    @Query() offsetPageArgsDto: OffsetPageArgsDto,
  ) {
    return await this.ordersService.findAllDeletedWithPagination(
      offsetPageArgsDto,
    );
  }

  @Get('report')
  @ApiOkResponse({ type: OrderReportEntity })
  async getOrderReport(@Query() orderReportDto: OrderReportDateRangeDto) {
    return new OrderReportEntity(
      await this.orderReportsService.orderReport(orderReportDto),
    );
  }

  @Get('graph')
  @ApiOkResponse({ type: OrderGraphEntity })
  async getOrderGraphReport(@Query() orderReportDto: OrderReportDateRangeDto) {
    return new OrderGraphEntity(
      await this.orderReportsService.orderGraphReport(orderReportDto),
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: OrderEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return new OrderEntity(await this.ordersService.findOne(id));
  }

  @Patch(':id')
  @ApiOkResponse({ type: OrderEntity })
  @ApiBody({ type: UpdateOrderCombinedEntity })
  async update(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrder: UpdateOrderDto,
    @Body() updateClientInfo: UpdateOrderClientInfoDto,
  ) {
    const updatedOrder = await this.ordersService.update(id, user, {
      updateOrder,
      updateClientInfo,
    });
    return new OrderEntity(updatedOrder);
  }

  @Post('upload/:id')
  @ApiOkResponse({ type: OrderEntity })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async profilePhoto(
    @Param('id', ParseIntPipe) id: number,
    @Body() { image_delete }: UploadPhotoDto,
    @UploadedFile(new FileValidationPipe())
    image?: Express.Multer.File | null,
  ) {
    const order = await this.ordersService.findUniqueOrThrow({ where: { id } });
    return new OrderEntity(
      await this.ordersService.uploadPhoto(order, image, image_delete),
    );
  }

  @Delete(':id')
  async remove(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.ordersService.remove(id, user);
    return { message: 'Successfully Deleted Order Review' };
  }
}
