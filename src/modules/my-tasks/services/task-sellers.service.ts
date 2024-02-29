import { DatabaseService } from '@modules/database/services/database.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TaskSellerEntity } from '../entities/task-seller.entity';
import { createPaginator } from 'prisma-pagination';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';

@Injectable()
export class TaskSellersService {
  constructor(private readonly database: DatabaseService) {}

  async paginate(
    authUser: UserEntity,
    offsetPageArgsDto: OffsetPageArgsDto,
    completed?: boolean,
  ) {
    const { perPage } = offsetPageArgsDto;
    const database = await this.database.softDelete();
    const paginate = createPaginator({ perPage });

    const findManyQuery = await this.findAllQuery(authUser, completed);

    const paginatedTaskSellers = await paginate<
      TaskSellerEntity,
      Prisma.TaskSellerFindManyArgs
    >(database.taskSeller, findManyQuery, offsetPageArgsDto);

    paginatedTaskSellers.data = paginatedTaskSellers.data.map(
      (taskAccountant) => new TaskSellerEntity(taskAccountant),
    );

    return paginatedTaskSellers;
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
