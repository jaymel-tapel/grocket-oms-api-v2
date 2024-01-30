import { PageInfo } from '@devoxa/prisma-relay-cursor-connection';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PageInfoEntity implements PageInfo {
  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;

  @ApiPropertyOptional({ type: Number })
  startCursor?: string;

  @ApiPropertyOptional({ type: Number })
  endCursor?: string;
}
