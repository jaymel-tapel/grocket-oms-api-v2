import { UserEntity } from '@modules/users/entities/user.entity';
import { RoleEnum } from '@prisma/client';

export const taskRelationHelper = (authUser: UserEntity) => {
  let taskRelation: 'taskAccountant' | 'taskSeller';

  if (authUser.role === RoleEnum.ACCOUNTANT) {
    taskRelation = 'taskAccountant';
  } else {
    taskRelation = 'taskSeller';
  }

  return taskRelation;
};
