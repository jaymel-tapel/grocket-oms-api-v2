import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { DatabaseService } from '../../database/services/database.service';
import { HashService } from '../../auth/services/hash.service';
import { Prisma, StatusEnum } from '@prisma/client';
import { FilterUsersDto } from '../dto/filter-user.dto';
import { UserEntity } from '../entities/user.entity';
import { findManyUsers } from '../helpers/find-many-users.helper';
import { OffsetPageArgsDto } from '@modules/offset-page/page-args.dto';
import { createPaginator } from 'prisma-pagination';

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

  async findAllByOffset(
    filterArgs: FilterUsersDto,
    offsetPageArgsDto: OffsetPageArgsDto,
  ) {
    const { perPage } = offsetPageArgsDto;
    const database = filterArgs.showInactive
      ? this.database
      : await this.database.softDelete();
    const paginate = createPaginator({ perPage });

    const findManyQuery = await findManyUsers(filterArgs, this.database);

    const paginatedUsers = await paginate<UserEntity, Prisma.UserFindManyArgs>(
      database.user,
      findManyQuery,
      offsetPageArgsDto,
    );

    paginatedUsers.data = paginatedUsers.data.map(
      (user) => new UserEntity(user),
    );

    return paginatedUsers;
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

    const foundUser = await database.user.findUniqueOrThrow({
      where: { id },
      include: { clients: true },
    });

    if (foundUser.clients.length > 0) {
      throw new HttpException(
        `Unable to delete user with ${foundUser.clients.length} assigned clients.`,
        400,
      );
    }

    const user = await database.user.delete({
      where: { id },
    });

    await database.user.update({
      where: { id: user.id },
      data: { status: 'DELETED' },
    });

    await database.alternateEmail.deleteMany({
      where: { userId: user.id, deletedAt: null },
    });

    return user;
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
