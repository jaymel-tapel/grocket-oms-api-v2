import { HttpException } from '@nestjs/common';
import { FilterDto } from '../dtos/search-filter.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { Prisma } from '@prisma/client';

type TableNameTypes = Prisma.TypeMap['meta']['modelProps'];

export async function dateRange(
  { from, to, options }: FilterDto,
  database: DatabaseService,
  tableName: TableNameTypes,
  showDeleted?: boolean,
) {
  let startDate: Date, endDate: Date, firstData: any;

  if (!from && to) {
    let whereClause: any;

    switch (tableName) {
      case 'user':
        whereClause = showDeleted
          ? { status: 'DELETED' }
          : { status: 'ACTIVE' };
        break;
      case 'client':
        whereClause = {
          clientInfo: { status: 'ACTIVE', brand: { code: options?.code } },
        };
        break;
      case 'order':
        whereClause = showDeleted
          ? {
              deletedAt: { not: null },
              brand: { code: options?.code },
            }
          : {
              deletedAt: null,
              brand: { code: options?.code },
            };
        break;
      default:
        throw new Error(`Invalid table name: ${tableName}`);
    }

    firstData = await(database[tableName] as any).findFirst({
      where: whereClause,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    startDate = firstData?.createdAt ?? new Date();
    endDate = new Date(to);
  } else if (from || to) {
    startDate = new Date(from ?? null);
    endDate = new Date(to ?? Date.now());

    // console.log(startDate, endDate);
    if (startDate > endDate) {
      throw new HttpException(
        `Start Date (${startDate.toDateString()}) should not be greater than End Date (${endDate.toDateString()})`,
        400,
      );
    }
  }

  startDate?.setUTCHours(0, 0, 0, 0);
  endDate?.setUTCHours(23, 59, 59, 999);

  return { startDate, endDate };
}
