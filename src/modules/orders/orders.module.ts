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
import { OrderReportsService } from './services/order-reports.service';
import { InvoicesModule } from '@modules/invoices/invoices.module';
import { TasksModule } from '@modules/my-tasks/tasks.module';

@Module({
  imports: [
    ClientsModule,
    UsersModule,
    CompaniesModule,
    CloudinaryModule,
    InvoicesModule,
    TasksModule,
  ],
  controllers: [OrdersController, OrderReviewsController],
  providers: [
    OrdersService,
    OrderLogsService,
    OrderReviewsService,
    OrderReportsService,
  ],
  exports: [OrdersService, OrderLogsService, OrderReviewsService],
})
export class OrdersModule {}
