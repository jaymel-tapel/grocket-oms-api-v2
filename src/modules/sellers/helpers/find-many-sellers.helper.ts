import { Prisma, RoleEnum } from '@prisma/client';
import { UserEntity } from '@modules/users/entities/user.entity';
import { DatabaseService } from '@modules/database/services/database.service';
import { dateRange } from '@src/common/helpers/date-range';
import { FilterSellersDto } from '../dto/filter-seller.dto';

async function baseFindManyQuery(
  findManyArgs: FilterSellersDto,
  database: DatabaseService,
) {
  let findManyQuery: Prisma.UserFindManyArgs = {
    orderBy: {
      createdAt: 'asc',
    },
    where: { role: RoleEnum.SELLER },
  };

  const range = await dateRange(findManyArgs, database, 'user');

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

  return findManyQuery;
}

export async function findManySellers(
  findManyArgs: FilterSellersDto,
  database: DatabaseService,
) {
  const { keyword, from, to } = findManyArgs;

  let findManyQuery = await baseFindManyQuery({ from, to }, database);

  if (keyword) {
    findManyQuery = await queryFindManyForSeller(keyword, findManyQuery);
  }

  return findManyQuery;
}

async function queryFindManyForSeller(
  keyword: string,
  findManyQuery: Prisma.UserFindFirstArgs,
) {
  findManyQuery = {
    ...findManyQuery,
    where: {
      ...findManyQuery.where,
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
      ],
    },
  };

  return findManyQuery;
}
