import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import { ProspectsService } from './prospects.service';
import { CreateProspectSession } from '../dto/create-prospect-session.dto';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ProspectSessionEntity } from '../entities/prospect-session.entity';
import { ProspectLogsService } from './prospect-logs.service';
import { Prisma } from '@prisma/client';
import {
  IPrismaOptionsManyQuery,
  IPrismaOptionsQuery,
} from '@src/common/interfaces/prisma-query.interface';

@Injectable()
export class ProspectSessionService {
  constructor(
    private readonly database: DatabaseService,
    private readonly prospectsService: ProspectsService,
    private readonly prospectLogsService: ProspectLogsService,
  ) {}

  async create(
    createProspectSessionDto: CreateProspectSession,
    authUser: UserEntity,
  ): Promise<ProspectSessionEntity> {
    const { prospects, ...data } = createProspectSessionDto;

    const templateId = 1;
    let position = 1;

    const newProspectsMap = prospects.map((session) => ({
      ...session,
      position: position++,
    }));

    // * Increment other prospects' positions by 1 based on the last position in the new session
    await this.prospectsService.adjustPositions(templateId, position);

    const newSession = await this.database.$transaction(async (tx) => {
      return await tx.prospectSession.create({
        data: {
          ...data,
          prospects: {
            create: newProspectsMap,
          },
        },
        include: { prospects: true },
      });
    });

    await Promise.all(
      newSession.prospects.map((prospect) => {
        return this.prospectLogsService.createLog(prospect.id, authUser, {
          templateId,
          action: 'prospect created',
        });
      }),
    );

    return newSession;
  }

  async findOne(
    args?: Prisma.ProspectSessionFindFirstArgs,
    opts?: IPrismaOptionsQuery,
  ) {
    const database = opts?.withTrashed
      ? this.database
      : await this.database.softDelete();

    return await database.prospectSession.findFirst(args);
  }

  async findMany(
    args?: Prisma.ProspectSessionFindManyArgs,
    opts?: IPrismaOptionsManyQuery,
  ) {
    const database = opts?.withTrashed
      ? this.database
      : await this.database.softDelete();

    return await database.prospectSession.findMany({
      ...args,
      orderBy: {
        ...(opts?.latest && { createdAt: 'desc' }),
        ...args?.orderBy,
      },
    });
  }
}
