import { Module } from '@nestjs/common';
import { EventsService } from './services/events.service';
import { Subscribers } from './subscribers';
import { OrdersModule } from '@modules/orders/orders.module';

@Module({
  imports: [OrdersModule],
  providers: [EventsService, ...Subscribers],
  exports: [EventsService, ...Subscribers],
})
export class EventsModule {}
