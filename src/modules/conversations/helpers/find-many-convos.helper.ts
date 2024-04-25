import { UserEntity } from '@modules/users/entities/user.entity';
import { FilterConversationDto } from '../dto/filter-conversation.dto';
import { Prisma } from '@prisma/client';

export const findManyConvos = async (
  findManyArgs: FilterConversationDto,
  authUser: UserEntity,
) => {
  const { keyword } = findManyArgs;

  let findManyQuery: Prisma.ConversationFindManyArgs = {
    where: {
      participants: {
        some: {
          userId: authUser.id,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          client: { select: { id: true, name: true, email: true } },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  };

  if (keyword) {
    findManyQuery = {
      where: {
        participants: {
          ...findManyQuery.where.participants,
          some: {
            OR: [
              {
                user: {
                  OR: [
                    { name: { contains: keyword, mode: 'insensitive' } },
                    { email: { contains: keyword, mode: 'insensitive' } },
                  ],
                },
              },
              {
                sent_messages: {
                  some: {
                    content: { contains: keyword, mode: 'insensitive' },
                  },
                },
              },
            ],
          },
        },
      },
      include: {
        ...findManyQuery.include,
      },
    };
  }

  return findManyQuery;
};
