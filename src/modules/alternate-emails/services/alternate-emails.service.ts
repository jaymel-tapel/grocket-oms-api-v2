import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/services/database.service';
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/modules/users/services/users.service';
import { FindAlternateDto } from '../dto/find-alternate-email.dto';

@Injectable()
export class AlternateEmailsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly userService: UsersService,
  ) {}

  async create(
    createAlternateEmailDto: Prisma.AlternateEmailUncheckedCreateInput,
  ) {
    const result = await this.database.$transaction(async (tx) => {
      const foundEmail = await this.userService.findByCondition({
        where: { email: createAlternateEmailDto.email },
      });

      // ? Check if userId does exist
      await this.userService.findOne(createAlternateEmailDto.userId);

      if (foundEmail) throw new ConflictException('Email already exists');

      return await tx.alternateEmail.create({ data: createAlternateEmailDto });
    });

    return result;
  }

  async findAll(query: FindAlternateDto) {
    const database = await this.database.softDelete();
    return await database.alternateEmail.findMany({
      where: {
        ...query,
        email: {
          contains: query.email,
        },
      },
      include: { user: true },
    });
  }

  async findOne(id: number) {
    const database = await this.database.softDelete();
    const user = await database.alternateEmail.findUniqueOrThrow({
      where: { id },
      include: {
        user: true,
      },
    });

    return user;
  }

  async update(
    id: number,
    updateAlternateEmailDto: Prisma.AlternateEmailUpdateInput,
  ) {
    const database = await this.database.softDelete();
    const result = await database.$transaction(async (tx) => {
      return await tx.alternateEmail.update({
        where: { id },
        data: updateAlternateEmailDto,
      });
    });

    return result;
  }

  async remove(id: number) {
    const database = await this.database.softDelete();
    return await database.alternateEmail.delete({ where: { id } });
  }
}
