import { DatabaseService } from '@modules/database/services/database.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { ClientEntity } from '@modules/clients/entities/client.entity';
import {
  CreatedByEnum,
  Prisma,
  RoleEnum,
  TaskStatusEnum,
} from '@prisma/client';
import { TaskEntity } from '../entities/task.entity';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { AbilityFactory, Action } from '@modules/casl/ability.factory';
import { ForbiddenError } from '@casl/ability';
import { TaskSellersService } from './task-sellers.service';
import { TaskAccountantsService } from './task-accountants.service';
import { dd } from '@src/common/helpers/debug';
import { taskIncludeHelper } from '../helpers/task-include.helper';
import { taskRelationHelper } from '../helpers/task-relation-table.helper';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly database: DatabaseService,
    private readonly abilityFactory: AbilityFactory,
    private readonly taskSellersService: TaskSellersService,
    private readonly taskAccountantsService: TaskAccountantsService,
  ) {}

  async create(authUser: UserEntity, createTaskDto: CreateTaskDto) {
    const {
      note,
      client_email,
      createdBy: createdByDto,
      orderId,
      taskType,
      ...data
    } = createTaskDto;

    let client: ClientEntity;

    if (client_email) {
      client = await this.database.client.findFirstOrThrow({
        where: { email: client_email },
      });
    }

    let createdBy: CreatedByEnum;

    if (createdByDto) {
      createdBy = createdByDto;
    } else {
      createdBy =
        authUser.role === RoleEnum.SELLER
          ? CreatedByEnum.SELLER
          : CreatedByEnum.ACCOUNTANT;
    }

    const newTask = await this.database.task.create({
      data: {
        user: { connect: { id: authUser.id } },
        createdBy,
        ...(taskType && { taskType }),
        ...(orderId && { order: { connect: { id: orderId }}}),
        ...(client_email && {
          client: {
            connect: {
              id: client.id,
            },
          },
        }),
        ...(note && {
          taskNotes: {
            create: { note, user: { connect: { id: authUser.id } } },
          },
        }),
      },
      include: taskIncludeHelper(authUser, { includeTaskNotes: true }),
    });

    await this.updateOrCreateTaskAccountantAndSeller(newTask, data, authUser);

    return newTask;
  }

  private async updateOrCreateTaskAccountantAndSeller(task: TaskEntity, taskDto: CreateTaskDto | UpdateTaskDto, authUser: UserEntity) {
    const {
      note,
      client_email,
      createdBy: createdByDto,
      orderId,
      ...data
    } = taskDto;
    
    const tx = await this.database.softDelete();

    let upsertQuery: Prisma.TaskSellerUpsertArgs | Prisma.TaskAccountantUpsertArgs = {
      where: { taskId: task.id },
      update: data,
      create: {
        taskId: task.id,
        ...data as CreateTaskDto,
      },
    };
  
    if (task.createdBy === 'AUTO') {
      upsertQuery = {
        ...upsertQuery,
        update: {
          ...upsertQuery.update,
          status: 'ACTIVE'
        }
      };

      await tx.taskAccountant.upsert(upsertQuery as Prisma.TaskAccountantUpsertArgs);
      await tx.taskSeller.upsert(upsertQuery as Prisma.TaskSellerUpsertArgs);
    } else if (authUser.role === RoleEnum.ACCOUNTANT) {
      await tx.taskAccountant.upsert(upsertQuery as Prisma.TaskAccountantUpsertArgs);
    } else {
      await tx.taskSeller.upsert(upsertQuery as Prisma.TaskSellerUpsertArgs);
    }
  }

  async findOne(args: Prisma.TaskFindFirstArgs) {
    const database = await this.database.softDelete();
    const task = await database.task.findFirst(args);
    return new TaskEntity(task);
  }

  async findUniqueOrThrow(args: Prisma.TaskFindUniqueArgs) {
    const database = await this.database.softDelete();
    const task = await database.task.findUniqueOrThrow(args);
    return new TaskEntity(task);
  }

  async findAllWithPagination(
    authUser: UserEntity,
    offsetPageArgsDto: OffsetPageArgsDto,
    completed?: boolean,
  ) {
    if (authUser.role === RoleEnum.ACCOUNTANT) {
      return await this.taskAccountantsService.paginate(
        authUser,
        offsetPageArgsDto,
        completed,
      );
    } else {
      return await this.taskSellersService.paginate(
        authUser,
        offsetPageArgsDto,
        completed,
      );
    }
  }

  async findAllByCondition(args: Prisma.TaskFindManyArgs) {
    const database = await this.database.softDelete();
    return await database.task.findMany(args);
  }

  async update(authUser: UserEntity, id: number, updateTaskDTo: UpdateTaskDto) {
    const { note, client_email, createdBy, orderId, taskType, ...data } = updateTaskDTo;
    let client: ClientEntity;

    if (!taskType) {
      const ability = await this.abilityFactory.defineAbility(authUser);
      const foundTask = await this.findUniqueOrThrow({ where: { id } });

      ForbiddenError.from(ability).throwUnlessCan(Action.Update, foundTask);
    }

    if (client_email) {
      client = await this.database.client.findFirstOrThrow({
        where: { email: client_email },
      });
    }

    const updatedTask = await this.database.task.update({
      where: { id },
      data: {
        ...(client_email && {
          client: { connect: { id: client.id } },
        }),
        ...(taskType && { taskType }),
        ...(note && {
          taskNotes: {
            upsert: {
              where: { userId_taskId: { taskId: id, userId: authUser.id } },
              update: { note },
              create: { note, user: { connect: { id: authUser.id } } },
            },
          },
        }),
      },
      include: taskIncludeHelper(authUser, { includeTaskNotes: true }),
    });

    await this.updateOrCreateTaskAccountantAndSeller(updatedTask, data, authUser);

    return updatedTask;
  }

  async updateTaskStatus(
    id: number,
    authUser: UserEntity,
    setToActive?: boolean,
  ) {
    const ability = await this.abilityFactory.defineAbility(authUser);
    const foundTask = await this.findUniqueOrThrow({ where: { id } });

    ForbiddenError.from(ability).throwUnlessCan(Action.Update, foundTask);

    return await this.database.$transaction(async (tx) => {
      const taskRelation = taskRelationHelper(authUser);
      let status: TaskStatusEnum, completedAt: Date | null;

      if (setToActive) {
        status = 'ACTIVE';
        completedAt = null;
      } else {
        status = 'COMPLETED';
        completedAt = new Date();
      }

      const updatedTask = await tx.task.update({
        where: { id },
        data: {
          [taskRelation]: {
            update: {
              status,
              completedAt,
            },
          },
        },
      });

      return new TaskEntity(updatedTask);
    });
  }

  async remove(id: number, authUser: UserEntity) {
    const database = await this.database.softDelete();
    const ability = await this.abilityFactory.defineAbility(authUser);
    const foundTask = await this.findUniqueOrThrow({ where: { id } });

    ForbiddenError.from(ability).throwUnlessCan(Action.Update, foundTask);

    return await database.$transaction(async (tx) => {
      if (authUser.role === RoleEnum.ACCOUNTANT) {
        await tx.taskAccountant.delete({
          where: { taskId: id },
        });

        await tx.taskAccountant.update({
          where: { taskId: id },
          data: { status: 'DELETED' },
        });
      } else {
        await tx.taskSeller.delete({
          where: { taskId: id },
        });

        await tx.taskAccountant.update({
          where: { taskId: id },
          data: { status: 'DELETED' },
        });
      }

      const deletedTask = await tx.task.delete({
        where: { id },
      });

      return deletedTask;
    });
  }

  async restore(id: number, authUser: UserEntity) {
    const ability = await this.abilityFactory.defineAbility(authUser);
    const foundTask = await this.findUniqueOrThrow({ where: { id } });

    ForbiddenError.from(ability).throwUnlessCan(Action.Update, foundTask);

    return await this.database.$transaction(async (tx) => {
      await tx.task.findUniqueOrThrow({ where: { id } });

      return await tx.task.update({
        where: { id },
        data: {
          deletedAt: null,
          ...(authUser.role === RoleEnum.ACCOUNTANT && {
            taskAccountant: {
              update: {
                where: { taskId: id },
                data: {
                  status: 'ACTIVE',
                  deletedAt: null,
                },
              },
            },
          }),
          ...(authUser.role === RoleEnum.SELLER && {
            taskSeller: {
              update: {
                where: { taskId: id },
                data: {
                  status: 'ACTIVE',
                  deletedAt: null,
                },
              },
            },
          }),
        },
        include: taskIncludeHelper(authUser),
      });
    });
  }
}
