import { JwtGuard } from '@modules/auth/guard';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CsvService } from './services/csv.service';
import { Response } from 'express';

@UseGuards(JwtGuard)
@Controller('csv')
@ApiTags('csv')
@ApiBearerAuth()
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Get('export/client')
  async exportClient(@Res() res: Response) {
    await this.csvService.exportClients(res);
  }
}
