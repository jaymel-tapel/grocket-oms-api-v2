import {
  AbilityBuilder,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
} from '@casl/ability';
import { PrismaQuery, createPrismaAbility } from '@casl/prisma';
import { ClientEntity } from '@modules/clients/entities/client.entity';
import { TaskEntity } from '@modules/my-tasks/entities/task.entity';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { RoleEnum } from '@prisma/client';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppSubjects =
  | InferSubjects<typeof UserEntity | typeof TaskEntity | typeof ClientEntity>
  | 'all';

export type AppAbility = PureAbility<[Action, AppSubjects], PrismaQuery>;

@Injectable()
export class AbilityFactory {
  async defineAbility(user: UserEntity) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    if (user.role === RoleEnum.ADMIN) {
      can(Action.Manage, 'all');
      cannot(Action.Manage, TaskEntity).because(
        'Only Sellers and Accountants are allowed to access this',
      );
    } else if (user.role === RoleEnum.ACCOUNTANT) {
      can(Action.Manage, UserEntity);
    } else {
      can(Action.Read, ClientEntity);
      cannot(Action.Read, ClientEntity, {
        sellerId: { not: user.id },
      }).because('You can only access your own clients');
      cannot(Action.Manage, UserEntity).because(
        'Only Admins and Accountants are allowed to manage this',
      );
    }

    const ability = build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<AppSubjects>,
    });

    return ability;
  }
}
