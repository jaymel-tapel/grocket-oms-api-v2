import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RatingsService } from './services/ratings.service';
import { JwtGuard } from '@modules/auth/guard';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DailyRatingEntity } from './entities/daily-rating.entities';

@UseGuards(JwtGuard)
@Controller('ratings')
@ApiTags('ratings')
@ApiBearerAuth()
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get(':companyId')
  @ApiOkResponse({ type: DailyRatingEntity })
  async fetchData(@Param('companyId', ParseIntPipe) id: number) {
    const rating = await this.ratingsService.getOrCreateRatings(id);
    return new DailyRatingEntity(rating);
  }
}
