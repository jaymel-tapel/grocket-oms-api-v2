import { Module } from '@nestjs/common';
import { ParticipantsService } from './services/participants.service';
import { ParticipantsController } from './participants.controller';

@Module({
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
  exports: [ParticipantsService],
})
export class ParticipantsModule {}
