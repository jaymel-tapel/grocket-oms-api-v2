import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule } from '@modules/clients/clients.module';
import { UsersModule } from '@modules/users/users.module';
import { CompaniesModule } from '@modules/companies/companies.module';

@Module({
  imports: [ClientsModule, UsersModule, CompaniesModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
