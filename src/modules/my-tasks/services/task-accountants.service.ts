import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { DatabaseService } from '@modules/database/services/database.service';
import { ConnectionArgsDto } from '@modules/page/connection-args.dto';
import { PageEntity } from '@modules/page/page.entity';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TaskAccountantEntity } from '../entities/task-accountant.entity';

@Injectable()
export class TaskAccountantsService {
  constructor(private readonly database: DatabaseService) {}

  async paginate(authUser: UserEntity, connectionArgs: ConnectionArgsDto) {
    const database = await this.database.softDelete();
    const findManyQuery = await this.findAllQuery(authUser);
    const page = await findManyCursorConnection(
      async (args) => {
        const { cursor, ...data } = args;

        const findManyArgs: Prisma.TaskAccountantFindManyArgs = {
          ...data,
          ...(cursor ? { cursor: { id: parseInt(cursor.id, 10) } } : {}), // Convert id to number if cursor is defined
          ...findManyQuery,
        };

        return await this.findAllByCondition(findManyArgs);
      },
      () =>
        database.taskAccountant.count({ where: { ...findManyQuery.where } }),
      connectionArgs,
      {
        recordToEdge: (record) => ({
          node: new TaskAccountantEntity(record),
        }),
      },
    );

    return new PageEntity<TaskAccountantEntity>(page);
  }

  async findAllByCondition(args: Prisma.TaskAccountantFindManyArgs) {
    const database = await this.database.softDelete();
    return await database.taskAccountant.findMany(args);
  }

  private async findAllQuery(authUser: UserEntity) {
    const findManyQuery: Prisma.TaskAccountantFindManyArgs = {
      where: {
        status: 'ACTIVE',
      },
      include: {
        task: {
          include: {
            user: true,
            taskNotes: {
              where: {
                userId: authUser.id,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    };

    return findManyQuery;
  }
}
