import { DatabaseService } from '@modules/database/services/database.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { ClientEntity } from '@modules/clients/entities/client.entity';
import { CreatedByEnum, Prisma, RoleEnum } from '@prisma/client';
import { TaskEntity } from '../entities/task.entity';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { AbilityFactory, Action } from '@modules/casl/ability.factory';
import { ForbiddenError } from '@casl/ability';

@Injectable()
export class TasksService {
  constructor(
    private readonly database: DatabaseService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  async create(authUser: UserEntity, createTaskDto: CreateTaskDto) {
    const { note, client_email, ...data } = createTaskDto;

    return await this.database.$transaction(async (tx) => {
      let client: ClientEntity;

      if (client_email) {
        client = await tx.client.findFirstOrThrow({
          where: { email: client_email },
        });
      }

      const createdBy =
        authUser.role === RoleEnum.SELLER
          ? CreatedByEnum.SELLER
          : CreatedByEnum.ACCOUNTANT;

      const newTask = await tx.task.create({
        data: {
          user: { connect: { id: authUser.id } },
          createdBy,
          ...(client_email && {
            client: {
              connect: {
                id: client.id,
              },
            },
          }),
          ...(note && {
            taskNotes: {
              create: [{ note, user: { connect: { id: authUser.id } } }],
            },
          }),
        },
        include: {
          taskAccountants: true,
          taskSellers: true,
          taskNotes: true,
        },
      });

      if (authUser.role === RoleEnum.ACCOUNTANT) {
        await tx.taskAccountant.create({
          data: {
            taskId: newTask.id,
            ...data,
          },
        });
      } else {
        await tx.taskSeller.create({
          data: {
            taskId: newTask.id,
            ...data,
          },
        });
      }

      return await this.findOne({ where: { id: newTask.id } });
    });
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

  async update(authUser: UserEntity, id: number, updateTaskDTo: UpdateTaskDto) {
    const { note, client_email, ...data } = updateTaskDTo;
    let client: ClientEntity;

    const ability = await this.abilityFactory.defineAbility(authUser);
    const foundTask = await this.findUniqueOrThrow({ where: { id } });

    ForbiddenError.from(ability).throwUnlessCan(Action.Read, foundTask);

    if (client_email) {
      client = await this.database.client.findFirstOrThrow({
        where: { email: client_email },
      });
    }

    // const updatedTask = await this.database.task.update({
    //   where: { id },
    //   data: {
    //     taskAccountants: {
    //       update: {
    //         where: { }
    //         data: { ...data },
    //       }
    //     }
    //   }
    // })

    // if (authUser.role === RoleEnum.ACCOUNTANT) {
    //   // ? Update the Accountant Task
    //   return await this.database.taskAccountant.update({
    //     where: { taskId: id },
    //     data: { ...data },
    //   });
    // }

    // return updatedTask;
  }
}
