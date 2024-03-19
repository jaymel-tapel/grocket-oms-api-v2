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

    const prospectsOriginalList = await this.database.prospect.findMany({
      where: { templateId },
    });

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

    const updateQuery = prospectsInDto
      .map((newProspect, i) => {
        const foundOrig = prospectsOriginalList.find(
          (orig) => orig.id === newProspect.id,
        );

        // ? New Element Found
        if (!foundOrig) {
          const newPosition = i + 1;

          const result: Prisma.ProspectUpdateArgs = {
            where: { id: newProspect.id },
            data: {
              position: newPosition,
              prospectTemplate: { connect: { id: templateId } },
            },
          };
          return result;
        } else {
          const newPosition =
            prospectsInDto.findIndex((newPros) => newPros.id === foundOrig.id) +
            1;

          if (
            newPosition !== foundOrig.position &&
            newProspect.position === foundOrig.position
          ) {
            return {
              where: { id: foundOrig.id },
              data: {
                position: newPosition,
              },
            };
          }
        }
      })
      .filter(Boolean);

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
