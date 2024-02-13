import { Prisma } from '@prisma/client';

export interface IOrderReport {
  startRange: Date;
  endRange: Date;
  orderQuery: Prisma.OrderFindManyArgs;
}
