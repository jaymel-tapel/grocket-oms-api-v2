import { HttpException } from '@nestjs/common';
import { FilterDto } from '../dtos/search-filter.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { Prisma } from '@prisma/client';

type TableNameTypes = Prisma.TypeMap['meta']['modelProps'];

export async function dateRange(
  { from, to }: FilterDto,
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
        whereClause = { clientInfo: { status: 'ACTIVE' } };
        break;
      case 'order':
        whereClause = { deletedAt: null };
        break;
      default:
        throw new Error(`Invalid table name: ${tableName}`);
    }

    firstData = await (database[tableName] as any).findFirst({
      where: whereClause,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    startDate = firstData?.createdAt ?? new Date();
    endDate = new Date(to.setUTCHours(23, 59, 59, 999));
  } else if (from || to) {
    startDate = new Date(from ?? null);
    endDate = new Date(to?.setUTCHours(23, 59, 59, 999) ?? Date.now());

    if (startDate > endDate) {
      throw new HttpException(
        `Start Date (${startDate.toDateString()}) should not be greater than End Date (${endDate.toDateString()})`,
        400,
      );
    }
  }

  return { startDate, endDate };
}
