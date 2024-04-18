import { Module } from '@nestjs/common';
import { ParticipantsService } from './services/participants.service';

@Module({
  providers: [ParticipantsService],
  exports: [ParticipantsService],
})
export class ParticipantsModule {}
