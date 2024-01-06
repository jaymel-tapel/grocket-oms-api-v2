import { ApiProperty } from "@nestjs/swagger";
import { EdgeEntity } from "./edge.entity";
import { PageInfoEntity } from "./page-info.dto";

export class PageEntity<T> {
  constructor(partial: Partial<PageEntity<T>>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  edges: EdgeEntity<T>[];

  @ApiProperty()
  pageInfo: PageInfoEntity;

  @ApiProperty()
  totalCount: number;
}