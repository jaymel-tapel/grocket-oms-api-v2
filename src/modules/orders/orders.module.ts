import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule } from '@modules/clients/clients.module';
import { UsersModule } from '@modules/users/users.module';
import { CompaniesModule } from '@modules/companies/companies.module';
import { OrderLogsService } from './services/order-logs.service';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';

@Module({
  imports: [ClientsModule, UsersModule, CompaniesModule, CloudinaryModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderLogsService],
  exports: [OrdersService],
})
export class OrdersModule {}
