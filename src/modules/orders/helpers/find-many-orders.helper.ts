import { DatabaseService } from '@modules/database/services/database.service';
import { FilterOrderDto, FilterOrderEnum } from '../dto/filter-order.dto';
import { dateRange } from '@src/common/helpers/date-range';
import { UserEntity } from '@modules/users/entities/user.entity';
import { OrderReviewStatus, PaymentStatusEnum, Prisma } from '@prisma/client';
import { orderIncludeHelper } from './order-include.helper';

async function baseFindManyQuery(
  findManyArgs: FilterOrderDto,
  database: DatabaseService,
  seller?: UserEntity,
) {
  let findManyQuery: Prisma.OrderFindManyArgs = {
    include: orderIncludeHelper(),
    orderBy: {
      createdAt: 'desc',
    },
  };

  if (seller) {
    findManyQuery = {
      ...findManyQuery,
      where: { client: { sellerId: seller.id } },
    };
  }

  const range = await dateRange(findManyArgs, database, 'order');

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

export const findManyOrdersQuery = async (
  filterOrderArgs: FilterOrderDto,
  database: DatabaseService,
) => {
  const { keyword, filter, from, to } = filterOrderArgs;

  let findManyQuery = await baseFindManyQuery({ from, to }, database);

  if (keyword) {
    switch (filter) {
      case FilterOrderEnum.CLIENT:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            client: {
              OR: [
                { name: { contains: keyword, mode: 'insensitive' } },
                { email: { contains: keyword, mode: 'insensitive' } },
              ],
            },
          },
          orderBy: {
            id: 'desc',
          },
        };
        break;
      case FilterOrderEnum.ORDER_ID:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            id: Number(keyword),
          },
        };
        break;
      case FilterOrderEnum.SELLER:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            client: {
              seller: {
                OR: [
                  { name: { contains: keyword, mode: 'insensitive' } },
                  { email: { contains: keyword, mode: 'insensitive' } },
                ],
              },
            },
          },
        };
        break;
      case FilterOrderEnum.COMPANY:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            company: {
              name: { contains: keyword, mode: 'insensitive' },
            },
          },
        };
        break;
      case FilterOrderEnum.PAYMENT_STATUS:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            payment_status: keyword as PaymentStatusEnum,
          },
        };
        break;
      case FilterOrderEnum.REVIEW_STATUS:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            orderReviews: {
              every: {
                status: keyword as OrderReviewStatus,
              },
            },
          },
        };
        break;
      case FilterOrderEnum.REVIEWER_NAME:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            orderReviews: {
              every: {
                name: { contains: keyword, mode: 'insensitive' },
              },
            },
          },
        };
        break;
      case FilterOrderEnum.REMARKS:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            remarks: { contains: keyword, mode: 'insensitive' },
          },
        };
        break;
      default:
        findManyQuery = allQuery(keyword, findManyQuery);
        break;
    }
  }

  return findManyQuery;
};

export const findManyOrdersQueryForSeller = async (
  seller: UserEntity,
  filterOrderArgs: FilterOrderDto,
  database: DatabaseService,
) => {
  const { keyword, filter, from, to } = filterOrderArgs;

  let findManyQuery = await baseFindManyQuery({ from, to }, database, seller);

  if (keyword) {
    switch (filter) {
      case FilterOrderEnum.CLIENT:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            client: {
              OR: [
                { name: { contains: keyword, mode: 'insensitive' } },
                { email: { contains: keyword, mode: 'insensitive' } },
              ],
            },
          },
          orderBy: {
            id: 'desc',
          },
        };
        break;
      case FilterOrderEnum.ORDER_ID:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            id: Number(keyword),
          },
        };
        break;
      case FilterOrderEnum.COMPANY:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            company: {
              name: { contains: keyword, mode: 'insensitive' },
            },
          },
        };
        break;
      case FilterOrderEnum.PAYMENT_STATUS:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            payment_status: keyword as PaymentStatusEnum,
          },
        };
        break;
      case FilterOrderEnum.REVIEW_STATUS:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            orderReviews: {
              every: {
                status: keyword as OrderReviewStatus,
              },
            },
          },
        };
        break;
      case FilterOrderEnum.REVIEWER_NAME:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            orderReviews: {
              every: {
                name: { contains: keyword, mode: 'insensitive' },
              },
            },
          },
        };
        break;
      case FilterOrderEnum.REMARKS:
        findManyQuery = {
          ...findManyQuery,
          where: {
            ...findManyQuery.where,
            remarks: { contains: keyword, mode: 'insensitive' },
          },
        };
        break;
      default:
        findManyQuery = searchOrdersForSeller(keyword, findManyQuery);
        break;
    }
  }

  return findManyQuery;
};

const allQuery = (keyword: string, findManyQuery: Prisma.OrderFindManyArgs) => {
  findManyQuery = {
    ...findManyQuery,
    where: {
      ...findManyQuery.where,
      OR: [
        {
          client: {
            OR: [
              {
                seller: {
                  OR: [
                    { name: { contains: keyword, mode: 'insensitive' } },
                    { email: { contains: keyword, mode: 'insensitive' } },
                  ],
                },
                OR: [
                  { name: { contains: keyword, mode: 'insensitive' } },
                  { email: { contains: keyword, mode: 'insensitive' } },
                ],
              },
            ],
          },
        },
        {
          remarks: { contains: keyword, mode: 'insensitive' },
        },
        {
          company: {
            name: { contains: keyword, mode: 'insensitive' },
          },
        },
      ],
    },
  };

  return findManyQuery;
};

const searchOrdersForSeller = (
  keyword: string,
  findManyQuery: Prisma.OrderFindManyArgs,
) => {
  findManyQuery = {
    ...findManyQuery,
    where: {
      ...findManyQuery.where,
      OR: [
        {
          client: {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { email: { contains: keyword, mode: 'insensitive' } },
            ],
          },
        },
        {
          remarks: { contains: keyword, mode: 'insensitive' },
        },
        {
          company: {
            name: { contains: keyword, mode: 'insensitive' },
          },
        },
      ],
    },
  };

  return findManyQuery;
};
