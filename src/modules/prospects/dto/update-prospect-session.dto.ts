import { PartialType } from '@nestjs/swagger';
import { CreateProspectSession } from './create-prospect-session.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateProspectSession extends PartialType(CreateProspectSession) {
  @IsOptional()
  @IsNumber()
  counter?: number;
}
