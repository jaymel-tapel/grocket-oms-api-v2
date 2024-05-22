import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './orders.controller';
import { UsersModule } from '@modules/users/users.module';
import { CompaniesModule } from '@modules/companies/companies.module';
import { OrderLogsService } from './services/order-logs.service';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';
import { OrderReviewsService } from './services/order-reviews.service';
import { OrderReviewsController } from './order-reviews.controller';
import { OrderReportsService } from './services/order-reports.service';
import { InvoicesModule } from '@modules/invoices/invoices.module';
import { TasksModule } from '@modules/my-tasks/tasks.module';
import { HashService } from '@modules/auth/services/hash.service';
import { ClientsService } from '@modules/clients/services/clients.service';
import { ClientEventsService } from '@modules/events/services/client-events.service';

@Module({
  imports: [
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
    ClientsService,
    ClientEventsService,
    HashService,
  ],
  exports: [OrdersService, OrderLogsService, OrderReviewsService],
})
export class OrdersModule {}
