import { Injectable } from '@nestjs/common';
import { UpdateProspectDto } from '../dto/update-prospect.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { Prisma } from '@prisma/client';
import { ProspectLogsService } from './prospect-logs.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { FilterProspectDto } from '../dto/filter-prospect.dto';

@Injectable()
export class ProspectsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly prospectLogsService: ProspectLogsService,
  ) {}

  async update(
    id: number,
    updateProspectDto: UpdateProspectDto,
    authUser?: UserEntity,
  ) {
    const { reviewers, ...data } = updateProspectDto;
    const templateId = data?.templateId;

    if (templateId) {
      // * Increment other prospects' position by 1
      await this.adjustPositions(templateId);
      data.position = 1;
    }

    const updatedProspect = await this.database.prospect.update({
      where: { id },
      data,
      include: { reviewers: true },
    });

    if (reviewers?.length > 0) {
      updatedProspect.reviewers = await Promise.all(
        reviewers.map(async (reviewer) => {
          const foundReviewer = await this.database.prospectReviewer.findFirst({
            where: {
              google_review_id: reviewer.google_review_id,
              prospectId: id,
            },
          });

          // ? Update Details of Reviewer
          if (foundReviewer) {
            return await this.database.prospectReviewer.update({
              where: { id: foundReviewer.id },
              data: reviewer,
            });
          } else {
            // ? Create Details of Reviewer
            return await this.database.prospectReviewer.create({
              data: {
                prospectId: id,
                ...reviewer,
              },
            });
          }
        }),
      );
    }

    if (authUser) {
      const action = templateId ? 'status updated' : 'prospect updated';

      await this.prospectLogsService.createLog(id, authUser, {
        templateId,
        action,
      });
    }

    return updatedProspect;
  }

  // * Increment other prospects' position by 1
  async adjustPositions(templateId: number, lastPosition?: number) {
    const prospectObjs = await this.database.prospect.findMany({
      where: { templateId },
      select: { id: true, position: true },
      orderBy: { position: 'asc' },
    });

    if (prospectObjs.length > 0) {
      let pos = lastPosition ?? 2;

      return await Promise.all(
        prospectObjs.map((existingProspect) =>
          this.database.prospect.update({
            where: { id: existingProspect.id },
            data: { position: pos++ },
          }),
        ),
      );
    }
  }

  async findAll(
    filterProspects?: FilterProspectDto,
    args?: Prisma.ProspectFindManyArgs,
  ) {
    const { sessionId } = filterProspects;
    const database = await this.database.softDelete();
    return await database.prospect.findMany({
      ...args,
      where: {
        ...(sessionId && { sessionId }),
        ...args?.where,
      },
      orderBy: { position: 'asc' },
    });
  }

  async findUnique(id: number) {
    const database = await this.database.softDelete();
    return await database.prospect.findUniqueOrThrow({ where: { id } });
  }

  async findOne(args: Prisma.ProspectFindFirstArgs) {
    const database = await this.database.softDelete();
    return await database.prospect.findFirst(args);
  }

  async findOneOrThrow(args: Prisma.ProspectFindFirstOrThrowArgs) {
    const database = await this.database.softDelete();
    return await database.prospect.findFirstOrThrow(args);
  }

  async remove(id: number) {
    const database = await this.database.softDelete();
    return await database.prospect.delete({ where: { id } })
  }
}
