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
  let findManyQuery: Prisma.ClientFindManyArgs = {
    include: {
      clientInfo: {
        include: { source: true },
      },
      seller: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  };

  if (seller) {
    findManyQuery = {
      ...findManyQuery,
      where: { sellerId: seller.id },
    };
  }

  const range = await dateRange(findManyArgs, database, 'client');

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
  const { keyword, clientLoggedIn, filter, from, to } = findManyArgs;

  // TODO: Include: Companies, Clients' Orders, Client
  let findManyQuery = await baseFindManyQuery({ from, to }, database);

  if (filter === FilterClientEnum.SELLER) {
    findManyQuery = {
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
          {
            OR: [{ seller: { name: 'unassigned' } }, { seller: null }],
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
  const { keyword, clientLoggedIn, from, to } = findManyArgs;

  // TODO: Include: Companies, Clients' Orders, Client
  let findManyQuery = await baseFindManyQuery({ from, to }, database, seller);

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
