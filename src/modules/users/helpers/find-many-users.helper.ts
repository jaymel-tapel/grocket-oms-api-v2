import { Prisma } from '@prisma/client';
import { FilterUserEnum, FilterUsersDto } from '../dto/filter-user.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { dateRange } from '@src/common/helpers/date-range';

async function baseFindManyQuery(
  filterUserArgs: FilterUsersDto,
  database: DatabaseService,
) {
  let findManyQuery: Prisma.UserFindManyArgs = {
    include: {
      alternateEmails: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  };

  const range = await dateRange(
    filterUserArgs,
    database,
    'user',
    filterUserArgs.showInactive,
  );

  if (range.startDate !== undefined && range.endDate !== undefined) {
    findManyQuery = {
      ...findManyQuery,
      where: {
        ...findManyQuery.where,
        createdAt: {
          gte: range.startDate,
          lte: range.endDate,
        },
      },
    };
  }

  if (filterUserArgs.showInactive) {
    findManyQuery = {
      ...findManyQuery,
      where: {
        ...findManyQuery.where,
        status: 'DELETED',
      },
    };
  }

  return findManyQuery;
}

export async function findManyUsers(
  filterUserArgs: FilterUsersDto,
  database: DatabaseService,
): Promise<Prisma.UserFindManyArgs> {
  const { keyword, filter, from, to, showInactive } = filterUserArgs;

  let findManyQuery: Prisma.UserFindManyArgs = await baseFindManyQuery(
    { from, to, showInactive },
    database,
  );

  if (keyword) {
    if (filter === FilterUserEnum.ID) {
      findManyQuery = {
        ...findManyQuery,
        where: {
          ...findManyQuery.where,
          id: parseInt(keyword),
        },
      };
    } else if (filter === FilterUserEnum.EMAIL) {
      findManyQuery = {
        ...findManyQuery,
        where: {
          ...findManyQuery.where,
          email: { contains: keyword, mode: 'insensitive' },
        },
      };
    } else if (!filter) {
      findManyQuery = {
        ...findManyQuery,
        where: {
          ...findManyQuery.where,
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { email: { contains: keyword, mode: 'insensitive' } },
            {
              alternateEmails: {
                some: {
                  email: { contains: keyword, mode: 'insensitive' },
                },
              },
            },
          ],
        },
      };
    }
  }

  return findManyQuery;
}
