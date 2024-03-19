import { ApiPropertyOptional } from '@nestjs/swagger';

export class IItem {
  @ApiPropertyOptional()
  businessName?: string;

  @ApiPropertyOptional()
  rating?: string;

  @ApiPropertyOptional()
  reviews?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  mapsUrl?: string;

  @ApiPropertyOptional()
  website?: string;
}
