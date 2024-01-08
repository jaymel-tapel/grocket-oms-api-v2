import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { DatabaseService } from '../../database/services/database.service';
import { HashService } from '../../auth/services/hash.service';
import { Prisma, StatusEnum } from '@prisma/client';
import { ConnectionArgsDto } from '@modules/page/connection-args.dto';
import { FilterUsersDto } from '../dto/filter-user.dto';
import { PageEntity } from '@modules/page/page.entity';
import { UserEntity } from '../entities/user.entity';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { findManyUsers } from '../helpers/find-many-users.helper';

@Injectable()
export class UsersService {
  constructor(
    private readonly database: DatabaseService,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const database = await this.database.softDelete();
    const result = await database.$transaction(async (tx) => {
      const foundUser = await this.findOneWithDeleted({
        email: createUserDto.email,
      });

      if (foundUser?.status === StatusEnum.BLOCKED) {
        throw new HttpException('User is blocked', 400);
      } else if (foundUser?.status === StatusEnum.DELETED) {
        return await this.restore(foundUser?.id);
      } else if (foundUser) {
        throw new HttpException('User already exists', 409);
      }

      createUserDto.password = await this.hashService.hashPassword(
        createUserDto.password,
      );

      const newUser = tx.user.create({
        data: createUserDto,
      });

      return await newUser;
    });

    return result;
  }

  async findAll() {
    const database = await this.database.softDelete();
    return await database.user.findMany({
      include: { alternateEmails: true },
    });
  }

  async findAllPagination(
    filterArgs: FilterUsersDto,
    connectionArgs: ConnectionArgsDto,
  ) {
    const database = await this.database.softDelete();

    let findManyQuery = await findManyUsers(filterArgs, this.database);

    const page = await findManyCursorConnection(
      // 👇 args contain take, skip and cursor
      async (args) => {
        const { cursor, ...data } = args;

        const findManyArgs: Prisma.UserFindManyArgs = {
          ...data,
          ...(cursor ? { cursor: { id: parseInt(cursor.id, 10) } } : {}), // Convert id to number if cursor is defined
          ...findManyQuery,
        };

        return await this.findAllByCondition(findManyArgs);
      },
      () => database.user.count({ where: { ...findManyQuery.where } }),
      connectionArgs,
      {
        recordToEdge: (record) => ({
          node: new UserEntity(record),
        }),
      },
    );

    return new PageEntity<UserEntity>(page);
  }

  async findAllByCondition(args: Prisma.UserFindManyArgs) {
    const database = await this.database.softDelete();
    return await database.user.findMany(args);
  }

  async findAllWithDeleted() {
    return await this.database.user.findMany({
      include: { alternateEmails: true },
    });
  }

  async findUniqueOrThrow(id: number) {
    const database = await this.database.softDelete();
    return await database.user.findUniqueOrThrow({
      where: { id },
    });
  }

  async findUniqueWithDeleted(id: number) {
    return await this.database.user.findUnique({ where: { id } });
  }

  async findUniqueByCondition(args: Prisma.UserFindUniqueArgs) {
    const database = await this.database.softDelete();
    return await database.user.findUnique(args);
  }

  async findOne(data: Prisma.UserWhereInput, args?: Prisma.UserFindFirstArgs) {
    const database = await this.database.softDelete();
    return await database.user.findFirst({
      where: { ...data },
      ...args,
    });
  }

  async findOneWithDeleted(
    data: Prisma.UserWhereInput,
    args?: Prisma.UserFindFirstArgs,
  ) {
    return await this.database.user.findFirst({
      where: {
        ...data,
        AND: {
          OR: [{ deletedAt: null }, { deletedAt: { not: null } }],
        },
      },
      ...args,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.database.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    const database = await this.database.softDelete();

    return await database.$transaction(async (tx) => {
      await tx.user.findUniqueOrThrow({ where: { id } });
      const user = await tx.user.delete({
        where: { id },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { status: 'DELETED' },
      });

      await tx.alternateEmail.deleteMany({
        where: { userId: user.id, deletedAt: { not: null } },
      });

      return user;
    });
  }

  async restore(id: number) {
    const database = await this.database.softDelete();
    const foundUser = await this.findUniqueWithDeleted(id);

    const user = await database.user.update({
      where: { id: foundUser.id },
      data: {
        deletedAt: null,
        status: 'ACTIVE',
      },
    });

    // ? Also restore all their alternate emails
    await database.alternateEmail.updateMany({
      where: {
        userId: user.id,
        deletedAt: {
          not: null,
        },
      },
      data: {
        deletedAt: null,
      },
    });

    return user;
  }
}
