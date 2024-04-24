import { FilterMessageDto } from '../dto/filter-message.dto';
import { Prisma } from '@prisma/client';

export const findManyMessages = async (findManyArgs: FilterMessageDto) => {
  const { keyword, conversationId } = findManyArgs;

  let findManyQuery: Prisma.MessageFindManyArgs = {
    where: { conversationId },
    include: {
      sender: {
        include: {
          user: true,
          client: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  };

  if (keyword) {
    findManyQuery = {
      ...findManyQuery,
      where: {
        ...findManyQuery.where,
        content: { contains: keyword, mode: 'insensitive' },
      },
    };
  }

  return findManyQuery;
};
