import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@modules/database/services/database.service';
import { CreateProspectTemplateDto } from '../dto/create-template.dto';
import {
  UpdateProspectTemplateDto,
  UpdateProspectsOrderByDto,
} from '../dto/update-template.dto';
import { Prisma } from '@prisma/client';
import { ProspectTemplateEntity } from '../entities/prospect-template.entity';
import { ProspectEntity } from '../entities/prospect.entity';
import { merge } from 'lodash';

@Injectable()
export class ProspectTemplatesService {
  constructor(private readonly database: DatabaseService) {}

  async create(createTemplateDto: CreateProspectTemplateDto) {
    return await this.database.$transaction(async (tx) => {
      return await tx.prospectTemplate.create({
        data: createTemplateDto,
      });
    });
  }

  async update(id: number, updateTemplateDto: UpdateProspectTemplateDto) {
    return await this.database.$transaction(async (tx) => {
      return await tx.prospectTemplate.update({
        where: { id },
        data: updateTemplateDto,
      });
    });
  }

  async updateProspectsPosition(
    templateId: number,
    { newProspectIds }: UpdateProspectsOrderByDto,
  ) {
    const templatesObj = await this.findAll({
      include: { prospects: true },
    });

    const templatesEntity = templatesObj.map(
      (temp) => new ProspectTemplateEntity(temp),
    );

    const prospectsInDto: ProspectEntity[] = newProspectIds.flatMap(
      (newProsId) =>
        templatesEntity.flatMap((existingTemplate) =>
          existingTemplate.prospects.filter((pros) => pros.id === newProsId),
        ),
    );

    // ? Checked for overlooked old prospects to the new array
    for (const template of templatesEntity) {
      template.prospects.map((oldProspect) => {
        if (
          !newProspectIds.includes(oldProspect.id) &&
          oldProspect.templateId === templateId
        ) {
          prospectsInDto.push(oldProspect);
        }
      });
    }

    let pos = 1;

    // TODO: Update All Position for each Templates whenever transferring a prospect to a new template

    const updateQuery = prospectsInDto.map((prospect) => {
      let result: Prisma.ProspectUpdateArgs = {
        where: { id: prospect.id },
        data: { position: pos++ },
      };

      if (prospect.templateId !== templateId) {
        result = {
          ...result,
          data: merge(result.data, {
            prospectTemplate: { connect: { id: templateId } },
          }),
        };
      }

      return result;
    });

    await Promise.all(
      updateQuery.map((query) => this.database.prospect.update(query)),
    );

    return await this.findAll();
  }

  async findAll(args?: Prisma.ProspectTemplateFindManyArgs) {
    const database = await this.database.softDelete();
    return await database.prospectTemplate.findMany({
      ...args,
      include: {
        ...args?.include,
        prospects: { orderBy: { position: 'asc' } },
      },
    });
  }

  async findUnique(id: number) {
    const database = await this.database.softDelete();
    return await database.prospectTemplate.findUniqueOrThrow({ where: { id } });
  }

  async findOne(args: Prisma.ProspectTemplateFindFirstArgs) {
    const database = await this.database.softDelete();
    return await database.prospectTemplate.findFirst(args);
  }

  async findOneOrThrow(args: Prisma.ProspectTemplateFindFirstOrThrowArgs) {
    const database = await this.database.softDelete();
    return await database.prospectTemplate.findFirstOrThrow(args);
  }

  // TODO
  async remove(id: number) {
    return `This action removes a #${id} prospect`;
  }
}
