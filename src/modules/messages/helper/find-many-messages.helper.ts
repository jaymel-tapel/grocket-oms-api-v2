import { FilterMessageDto } from '../dto/filter-message.dto';
import { Prisma } from '@prisma/client';

export const findManyMessagesQuery = async (findManyArgs: FilterMessageDto) => {
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
      createdAt: 'asc',
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
