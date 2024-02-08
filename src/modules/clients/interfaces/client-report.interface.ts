import { Prisma } from '@prisma/client';
import { IDateRange } from '@src/common/interfaces/date-range.interface';

export interface IClientReport extends IDateRange {
  clientQuery: Prisma.ClientFindManyArgs;
}
