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
import { UpdateProspectSession } from '../dto/update-prospect-session.dto';

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
    let position =
      (await this.prospectsService.findLastPosition(templateId)) ?? 0;

    const newProspectsMap = prospects.map((session) => ({
      ...session,
      position: ++position,
    }));

    const newSession = await this.database.prospectSession.create({
      data: {
        ...data,
        prospects: {
          create: newProspectsMap,
        },
      },
      include: { prospects: true },
    });

    await Promise.all(
      newSession.prospects.map((prospect) => {
        return this.prospectLogsService.createLog(prospect.id, authUser, {
          templateId,
          action: 'prospect created',
        });
      }),
    );

    return new ProspectSessionEntity(newSession);
  }

  async update(
    id: number,
    updateSessionDto: UpdateProspectSession,
    authUser: UserEntity,
  ) {
    const { prospects, ...sessionDto } = updateSessionDto;
    let newProspectsMap = [];

    if (prospects?.length > 0) {
      let position = await this.prospectsService.findLastPosition(1);

      newProspectsMap = prospects.map((prospect) => ({
        ...prospect,
        position: ++position,
      }));
    }

    const updatedSession = await this.database.prospectSession.update({
      where: { id },
      data: {
        ...sessionDto,
        ...(newProspectsMap?.length > 0 && {
          prospects: {
            create: newProspectsMap,
          },
        }),
      },
      include: { prospects: { orderBy: { position: 'desc' } } },
    });

    const sessionEntity = new ProspectSessionEntity(updatedSession);

    // ? Create Logs for new prospects
    if (prospects?.length > 0) {
      const foundProspects = await this.prospectsService.findAll({
        sessionId: sessionEntity.id,
      });

      const prospectsDto = new Set(
        prospects.map((prospect) => prospect.name.toLowerCase()),
      );

      // ? Filter out all the existing prospects and get only the non existing prospects in Session
      const newProspects = foundProspects.filter((foundProspect) =>
        prospectsDto.has(foundProspect.name.toLowerCase()),
      );

      await Promise.all(
        newProspects.map((prospect) => {
          return this.prospectLogsService.createLog(prospect.id, authUser, {
            templateId: 1,
            action: 'prospect created',
          });
        }),
      );
    }

    return sessionEntity;
  }

  async findOne(
    args: Prisma.ProspectSessionFindFirstArgs,
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
