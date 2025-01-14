import { Prisma } from '@prisma/client';
import { FilterClientEnum, FilterClientsDto } from '../dto/filter-client.dto';
import { UserEntity } from '@modules/users/entities/user.entity';
import { DatabaseService } from '@modules/database/services/database.service';
import { dateRange } from '@src/common/helpers/date-range';

async function baseFindManyQuery(
  findManyArgs: FilterClientsDto,
  database: DatabaseService,
  seller?: UserEntity,
) {
  const { from, to, code } = findManyArgs;

  let findManyQuery: Prisma.ClientFindManyArgs = {
    where: {
      clientInfo: { brand: { code } },
    },
    include: {
      clientInfo: {
        include: { source: true, industry: true },
      },
      seller: true,
      companies: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  };

  if (seller) {
    findManyQuery = {
      ...findManyQuery,
      where: { ...findManyQuery.where, sellerId: seller.id },
    };
  }

  const range = await dateRange(
    { from, to, options: { code } },
    database,
    'client',
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

  return findManyQuery;
}

export async function findManyClients(
  findManyArgs: FilterClientsDto,
  database: DatabaseService,
) {
  const { keyword, clientLoggedIn, filter } = findManyArgs;

  let findManyQuery = await baseFindManyQuery(findManyArgs, database);

  if (filter === FilterClientEnum.SELLER) {
    findManyQuery = !keyword
      ? await queryFindManyForSeller(keyword, findManyQuery)
      : {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            OR: [
              {
                seller: {
                  OR: [
                    { name: { contains: keyword, mode: 'insensitive' } },
                    { email: { contains: keyword, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          },
        };
  } else {
    findManyQuery = await queryFindManyForSeller(keyword, findManyQuery);
  }

  if (clientLoggedIn === true) {
    findManyQuery = await queryClientLoggedIn(findManyQuery);
  }

  return findManyQuery;
}

export async function sellerFindManyClients(
  seller: UserEntity,
  findManyArgs: FilterClientsDto,
  database: DatabaseService,
) {
  const { keyword, clientLoggedIn } = findManyArgs;

  let findManyQuery = await baseFindManyQuery(findManyArgs, database, seller);

  if (keyword) {
    findManyQuery = await queryFindManyForSeller(keyword, findManyQuery);
  }

  if (clientLoggedIn === true) {
    findManyQuery = await queryClientLoggedIn(findManyQuery);
  }

  return findManyQuery;
}

async function queryClientLoggedIn(findManyQuery: Prisma.ClientFindManyArgs) {
  findManyQuery = {
    ...findManyQuery,
    where: {
      ...findManyQuery.where,
      clientInfo: {
        hasLoggedIn: true,
      },
    },
  };

  return findManyQuery;
}

async function queryFindManyForSeller(
  keyword: string,
  findManyQuery: Prisma.ClientFindManyArgs,
) {
  findManyQuery = {
    ...findManyQuery,
    where: {
      ...findManyQuery.where,
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
        {
          clientInfo: {
            phone: { contains: keyword, mode: 'insensitive' },
            thirdPartyId: { contains: keyword, mode: 'insensitive' },
          },
        },
      ],
    },
  };

  return findManyQuery;
}
