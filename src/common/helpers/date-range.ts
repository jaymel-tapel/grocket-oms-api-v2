import { HttpException } from '@nestjs/common';
import { FilterDto } from '../dtos/search-filter.dto';
import { DatabaseService } from '@modules/database/services/database.service';

export async function dateRange(
  { from, to }: FilterDto,
  database: DatabaseService,
  tableName: string,
) {
  let startDate: Date, endDate: Date, firstData: any;

  if (!from && to) {
    if (tableName === 'user') {
      firstData = await database[tableName].findFirst({
        where: { status: 'ACTIVE' },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });
    } else if (tableName === 'client') {
      firstData = await database[tableName].findFirst({
        where: { clientInfo: { status: 'ACTIVE' } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });
    }

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
