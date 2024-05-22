import { Module } from '@nestjs/common';
import { CompanyEventsService } from './services/company-events.service';
import { Subscribers } from './subscribers';
import { OrdersModule } from '@modules/orders/orders.module';
import { ClientEventsService } from './services/client-events.service';

@Module({
  imports: [OrdersModule],
  providers: [CompanyEventsService, ClientEventsService, ...Subscribers],
  exports: [...Subscribers],
})
export class EventsModule {}
