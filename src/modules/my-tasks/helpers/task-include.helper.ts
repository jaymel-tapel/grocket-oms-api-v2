import { UserEntity } from '@modules/users/entities/user.entity';
import { Prisma, RoleEnum } from '@prisma/client';

type IOptions = {
  includeTaskNotes?: boolean;
};

export const taskIncludeHelper = (authUser: UserEntity, options?: IOptions) => {
  const { includeTaskNotes } = options;

  let include: Prisma.TaskInclude = {
    ...(authUser.role === RoleEnum.ACCOUNTANT && {
      taskAccountant: true,
    }),
    ...(authUser.role === RoleEnum.SELLER && {
      taskSeller: true,
    }),
  };

  if (includeTaskNotes) {
    include = {
      ...include,
      taskNotes: {
        where: {
          userId: authUser.id,
        },
      },
    };
  }

  return include;
};