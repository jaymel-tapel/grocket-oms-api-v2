import { PartialType } from '@nestjs/swagger';
import { CreateProspectSession } from './create-prospect-session.dto';

export class UpdateProspectSession extends PartialType(CreateProspectSession) {}
