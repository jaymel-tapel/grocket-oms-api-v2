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
  UpdateOrderCompanyDto,
  UpdateOrderDto,
} from './dto/update-order.dto';
import {
  ApiBearerAuth,
  ApiBody,
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
import { UpdateOrderCombinedDto } from './dto/update-order.dto';

@UseGuards(JwtGuard)
@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiCreatedResponse({ type: OrderEntity })
  @ApiBody({ type: CreateOrderEntity })
  async create(
    @AuthUser() user: UserEntity,
    @Body() createOrderDto: CreateOrderDto,
    @Body() createOrderClientDto: CreateOrderClientDto,
  ) {
    return new OrderEntity(
      await this.ordersService.create(
        user,
        createOrderDto,
        createOrderClientDto,
      ),
    );
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

  @Get(':id')
  @ApiOkResponse({ type: OrderEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return new OrderEntity(await this.ordersService.findOne(id));
  }

  @Patch(':id')
  @ApiOkResponse({ type: OrderEntity })
  @ApiBody({ type: UpdateOrderCombinedEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrder: UpdateOrderDto,
    @Body() updateClientInfo: UpdateOrderClientInfoDto,
    @Body() updateCompany: UpdateOrderCompanyDto,
  ) {
    return await this.ordersService.update(id, {
      updateOrder,
      updateClientInfo,
      updateCompany,
    });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersService.remove(id);
  }
}
