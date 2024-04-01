import { ApiPropertyOptional } from '@nestjs/swagger';

export class IItem {
  @ApiPropertyOptional()
  businessName?: string;

  @ApiPropertyOptional()
  rating?: number;

  @ApiPropertyOptional()
  reviews?: number;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  mapsUrl?: string;

  @ApiPropertyOptional()
  website?: string;
}
