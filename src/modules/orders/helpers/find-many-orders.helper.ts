import { DatabaseService } from '@modules/database/services/database.service';
import { FilterOrderDto, FilterOrderEnum } from '../dto/filter-order.dto';
import { dateRange } from '@src/common/helpers/date-range';
import { UserEntity } from '@modules/users/entities/user.entity';
import { OrderReviewStatus, PaymentStatusEnum, Prisma } from '@prisma/client';

async function baseFindManyQuery(
  findManyArgs: FilterOrderDto,
  database: DatabaseService,
  seller?: UserEntity,
) {
  const { from, to, code, showDeleted } = findManyArgs;

  let findManyQuery: Prisma.OrderFindManyArgs = {
    include: {
      client: {
        include: { clientInfo: true },
      },
      seller: true,
      company: true,
    },
    orderBy: {
      id: 'desc',
    },
    where: {
      brand: { code },
    },
  };

  if (seller) {
    findManyQuery = {
      ...findManyQuery,
      where: { ...findManyQuery.where, client: { sellerId: seller.id } },
    };
  }

  const range = await dateRange(
    { from, to, options: { code } },
    database,
    'order',
    showDeleted,
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

  if (showDeleted) {
    findManyQuery = {
      ...findManyQuery,
      where: {
        ...findManyQuery.where,
        deletedAt: { not: null },
        // AND: [
        //   {
        //     OR: [
        //       { seller: { deletedAt: { not: null } } },
        //       { client: { deletedAt: { not: null } } },
        //       { company: { deletedAt: { not: null } } },
        //       { deletedAt: { not: null } },
        //     ],
        //   },
        // ],
      },
    };
  } else {
    findManyQuery = {
      ...findManyQuery,
      where: {
        ...findManyQuery.where,
        // seller: { is: { deletedAt: null } },
        // client: { is: { deletedAt: null } },
        // company: { is: { deletedAt: null } },
        deletedAt: null,
      },
    };
  }

  return findManyQuery;
}

export const findManyOrdersQuery = async (
  filterOrderArgs: FilterOrderDto,
  database: DatabaseService,
) => {
  const { keyword, filter } = filterOrderArgs;

  let findManyQuery = await baseFindManyQuery(filterOrderArgs, database);

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
            OR: [
              {
                client: {
                  seller: {
                    OR: [
                      { name: { contains: keyword, mode: 'insensitive' } },
                      { email: { contains: keyword, mode: 'insensitive' } },
                    ],
                  },
                },
              },
              { seller_email: { contains: keyword, mode: 'insensitive' } },
            ],
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
              some: {
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
              some: {
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
  const { keyword, filter } = filterOrderArgs;

  let findManyQuery = await baseFindManyQuery(
    filterOrderArgs,
    database,
    seller,
  );

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
              some: {
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
              some: {
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
                    {
                      alternateEmails: {
                        some: {
                          email: { contains: keyword, mode: 'insensitive' },
                        },
                      },
                    },
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
        {
          seller_email: { contains: keyword, mode: 'insensitive' },
        },
      ],
    },
  };

  return findManyQuery;
};
