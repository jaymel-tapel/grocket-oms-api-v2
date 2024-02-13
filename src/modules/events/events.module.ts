import { Module } from '@nestjs/common';
import { EventsService } from './services/events.services';
import { Subscribers } from './subscribers';

@Module({
  providers: [EventsService, ...Subscribers],
  exports: [EventsService, ...Subscribers],
})
export class EventsModule {}
