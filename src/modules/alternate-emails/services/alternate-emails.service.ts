import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/services/database.service';
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/modules/users/services/users.service';
import { FindAlternateDto } from '../dto/find-alternate-email.dto';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { AlternateEmailDto } from '../dto/alternate-email.dto';
import { AlternateEmailEntity } from '../entities/alternate-email.entity';

@Injectable()
export class AlternateEmailsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly userService: UsersService,
  ) {}

  async upsert(user: UserEntity, alterEmailDto: AlternateEmailDto[]) {
    const emails: AlternateEmailEntity[] = [];

    const result = await this.database.$transaction(async (tx) => {
      // ? Force Delete All alternate emails that connects to the user
      await tx.alternateEmail.deleteMany({
        where: {
          userId: user.id,
        },
      });

      if (alterEmailDto.length === 0) {
        return [];
      }

      for (const dto of alterEmailDto) {
        const checkUser = await this.userService.findAllByCondition({
          where: { email: dto.email },
        });

        const foundAlternateEmail = await this.findByCondition({
          where: {
            userId: {
              not: user.id,
            },
            email: dto.email,
          },
        });

        if (!foundAlternateEmail && checkUser.length === 0) {
          // ? If alternate email doesn't exist yet, then Create new Alternate Email
          const newAlternateEmail = await tx.alternateEmail.create({
            data: {
              userId: user.id,
              email: dto.email,
            },
          });
          emails.push(newAlternateEmail);
        }
      }

      return emails;
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

  async findAllByCondition(args: Prisma.AlternateEmailFindManyArgs) {
    const database = await this.database.softDelete();
    return await database.alternateEmail.findMany(args);
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

  async findByCondition(args: Prisma.AlternateEmailFindFirstArgs) {
    const database = await this.database.softDelete();
    return await database.alternateEmail.findFirst(args);
  }

  async remove(id: number) {
    const database = await this.database.softDelete();
    return await database.alternateEmail.delete({ where: { id } });
  }

  async forceRemove(id: number) {
    return await this.database.alternateEmail.delete({ where: { id } });
  }
}
