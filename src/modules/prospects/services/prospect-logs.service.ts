import { DatabaseService } from '@modules/database/services/database.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { CreateProspectLogDto } from '../dto/create-prospect-log.dto';
import { Prisma } from '@prisma/client';
import { IPrismaOptionsManyQuery } from '@src/common/interfaces/prisma-query.interface';

@Injectable()
export class ProspectLogsService {
  constructor(private readonly database: DatabaseService) {}

  async createLog(
    id: number,
    authUser: UserEntity,
    createOrderLogDto: CreateProspectLogDto,
  ) {
    const { action, templateId } = createOrderLogDto;

    const templateObj = await this.database.prospectTemplate.findFirst({
      where: { id: templateId },
      select: { name: true },
    });

    return await this.database.prospectLog.create({
      data: {
        prospect: { connect: { id } },
        by: authUser.email,
        action,
        template: templateObj.name,
      },
    });
  }

  async findAll(
    args?: Prisma.ProspectLogFindManyArgs,
    options?: IPrismaOptionsManyQuery,
  ) {
    const database = options?.withTrashed
      ? this.database
      : await this.database.softDelete();

    return await database.prospectLog.findMany({
      ...args,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findAllStatusAndEmailOnly(
    args?: Prisma.ProspectLogFindManyArgs,
    options?: IPrismaOptionsManyQuery,
  ) {
    return await this.findAll(
      {
        ...args,
        where: {
          ...args?.where,
          OR: [
            { action: { contains: 'email', mode: 'insensitive' } },
            { action: { contains: 'status', mode: 'insensitive' } },
          ],
        },
      },
      options,
    );
  }
}
