import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule } from '@modules/clients/clients.module';
import { UsersModule } from '@modules/users/users.module';
import { CompaniesModule } from '@modules/companies/companies.module';
import { OrderLogsService } from './services/order-logs.service';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';
import { OrderReviewsService } from './services/order-reviews.service';
import { OrderReviewsController } from './order-reviews.controller';

@Module({
  imports: [ClientsModule, UsersModule, CompaniesModule, CloudinaryModule],
  controllers: [OrdersController, OrderReviewsController],
  providers: [OrdersService, OrderLogsService, OrderReviewsService],
  exports: [OrdersService, OrderReviewsService],
})
export class OrdersModule {}
