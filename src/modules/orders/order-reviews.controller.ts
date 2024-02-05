import { JwtGuard } from '@modules/auth/guard';
import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderReviewsService } from './services/order-reviews.service';
import { AuthUser } from '@modules/auth/decorator/auth-user.decorator';
import { UserEntity } from '@modules/users/entities/user.entity';
import { CreateOrderReviewWithOrderIDDto } from './dto/create-order-review.dto';
import { OrderReviewEntity } from './entities/order-review.entity';
import { UpdateOrderReviewDto } from './dto/update-order-review.dto';

@UseGuards(JwtGuard)
@ApiTags('order-reviews')
@Controller('order-reviews')
@ApiBearerAuth()
export class OrderReviewsController {
  constructor(private readonly orderReviewsService: OrderReviewsService) {}

  @Post()
  @ApiCreatedResponse({ type: OrderReviewEntity })
  @ApiBody({ type: CreateOrderReviewWithOrderIDDto })
  async create(
    @AuthUser() user: UserEntity,
    @Body() createOrderReviewDto: CreateOrderReviewWithOrderIDDto,
  ) {
    const newOrderReview = await this.orderReviewsService.create(
      user,
      createOrderReviewDto,
    );

    return new OrderReviewEntity(newOrderReview);
  }

  @Patch(':id')
  @ApiOkResponse({ type: OrderReviewEntity })
  async update(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderReviewDto: UpdateOrderReviewDto,
  ) {
    const updatedOrderReview = await this.orderReviewsService.update(
      id,
      updateOrderReviewDto,
      user,
    );

    return new OrderReviewEntity(updatedOrderReview);
  }

  @Delete(':id')
  async remove(
    @AuthUser() user: UserEntity,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.orderReviewsService.remove(id, user);
    return { message: 'Successfully Deleted Order Review' };
  }
}
