import { UserEntity } from '@modules/users/entities/user.entity';
import { Prisma, RoleEnum } from '@prisma/client';

type IOptions = {
  includeTaskNotes?: boolean;
  includeClient?: boolean;
  includeCompany?: boolean;
};

export const taskIncludeHelper = (authUser: UserEntity, options?: IOptions) => {
  let include: Prisma.TaskInclude = {
    ...(authUser.role === RoleEnum.ACCOUNTANT && {
      taskAccountant: true,
    }),
    ...(authUser.role === RoleEnum.SELLER && {
      taskSeller: true,
    }),
    ...(options?.includeClient && { client: true }),
    ...(options?.includeCompany && {
      order: { include: { company: { select: { name: true } } } },
    }),
  };

  if (options?.includeTaskNotes) {
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
