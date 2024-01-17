import { Prisma } from '@prisma/client';

export type ITable = {
  tableName: Prisma.TypeMap['meta']['modelProps'];
  column: string;
};
