import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/services/database.service';

@Injectable()
export class ClientInfoService {
  constructor(private readonly database: DatabaseService) {}
}
