import { DatabaseService } from '@modules/database/services/database.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TaskAccountantEntity } from '../entities/task-accountant.entity';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class TaskAccountantsService {
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

    const paginatedTaskAccountants = await paginate<
      TaskAccountantEntity,
      Prisma.TaskAccountantFindManyArgs
    >(database.taskAccountant, findManyQuery, offsetPageArgsDto);

    paginatedTaskAccountants.data = paginatedTaskAccountants.data.map(
      (taskAccountant) => new TaskAccountantEntity(taskAccountant),
    );

    return paginatedTaskAccountants;
  }

  async findAllByCondition(args: Prisma.TaskAccountantFindManyArgs) {
    const database = await this.database.softDelete();
    return await database.taskAccountant.findMany(args);
  }

  private async findAllQuery(authUser: UserEntity, completed?: Boolean) {
    const status: Prisma.TaskAccountantWhereInput['status'] = completed
      ? 'COMPLETED'
      : 'ACTIVE';

    const findManyQuery: Prisma.TaskAccountantFindManyArgs = {
      where: { status },
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
