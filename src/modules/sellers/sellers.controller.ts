import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@modules/auth/guard';

@UseGuards(JwtGuard)
@ApiTags('sellers')
@Controller('sellers')
@ApiBearerAuth()
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Get()
  findAll() {
    return this.sellersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellersService.findOne(+id);
  }
}
