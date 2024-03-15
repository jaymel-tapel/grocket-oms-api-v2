import { Injectable } from '@nestjs/common';
import { UpdateProspectDto } from '../dto/update-prospect.dto';
import { DatabaseService } from '@modules/database/services/database.service';
import { Prisma } from '@prisma/client';
import { ProspectLogsService } from './prospect-logs.service';
import { UserEntity } from '@modules/users/entities/user.entity';

@Injectable()
export class ProspectsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly prospectLogsService: ProspectLogsService,
  ) {}

  async update(
    id: number,
    authUser: UserEntity,
    updateProspectDto: UpdateProspectDto,
  ) {
    const { templateId } = updateProspectDto;

    if (templateId) {
      // * Increment other prospects' position by 1
      await this.adjustPositions(templateId);
      updateProspectDto.position = 1;
    }

    const updatedProspect = await this.database.$transaction(async (tx) => {
      return await tx.prospect.update({
        where: { id },
        data: updateProspectDto,
      });
    });

    const action = templateId ? 'status updated' : 'prospect updated';

    await this.prospectLogsService.createLog(id, authUser, {
      templateId,
      action,
    });

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

  async findAll(args?: Prisma.ProspectFindManyArgs) {
    const database = await this.database.softDelete();
    return await database.prospect.findMany({
      ...args,
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

    return await database.$transaction(
      async (tx) => await tx.prospect.delete({ where: { id } }),
    );
  }
}
