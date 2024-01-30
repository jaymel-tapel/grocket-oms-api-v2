import { DatabaseService } from '@modules/database/services/database.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TaskSellerEntity } from '../entities/task-seller.entity';
import { PageEntity } from '@modules/page/page.entity';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { ConnectionArgsDto } from '@modules/page/connection-args.dto';

@Injectable()
export class TaskSellersService {
  constructor(private readonly database: DatabaseService) {}

  async paginate(
    authUser: UserEntity,
    connectionArgs: ConnectionArgsDto,
    completed?: boolean,
  ) {
    const database = await this.database.softDelete();
    const findManyQuery = await this.findAllQuery(authUser, completed);
    const page = await findManyCursorConnection(
      async (args) => {
        const { cursor, ...data } = args;

        const findManyArgs: Prisma.TaskSellerFindManyArgs = {
          ...data,
          ...(cursor ? { cursor: { id: parseInt(cursor.id, 10) } } : {}), // Convert id to number if cursor is defined
          ...findManyQuery,
        };

        return await this.findAllByCondition(findManyArgs);
      },
      () => database.taskSeller.count({ where: { ...findManyQuery.where } }),
      connectionArgs,
      {
        recordToEdge: (record) => ({
          node: new TaskSellerEntity(record),
        }),
      },
    );

    return new PageEntity<TaskSellerEntity>(page);
  }

  async findAllByCondition(args: Prisma.TaskSellerFindManyArgs) {
    const database = await this.database.softDelete();
    return await database.taskSeller.findMany(args);
  }

  async findAllQuery(authUser: UserEntity, completed?: boolean) {
    const status: Prisma.TaskSellerWhereInput['status'] = completed
      ? 'COMPLETED'
      : 'ACTIVE';

    const findManyQuery: Prisma.TaskSellerFindManyArgs = {
      where: {
        status,
        task: {
          userId: authUser.id,
        },
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
