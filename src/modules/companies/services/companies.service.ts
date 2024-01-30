import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CompanyArgsDto } from '../dto/company-args.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private readonly database: DatabaseService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const { clientId, ...data } = createCompanyDto;
    return await this.database.$transaction(async (tx) => {
      // ? Find client if it is existing, throw an error if not.
      await tx.client.findUniqueOrThrow({
        where: { id: clientId },
      });

      return await tx.company.create({
        data: {
          ...data,
          client: {
            connect: {
              id: clientId,
            },
          },
        },
      });
    });
  }

  async findAll(companyArgs: CompanyArgsDto) {
    const database = await this.database.softDelete();
    return await database.company.findMany({
      where: companyArgs,
    });
  }

  async findOne(args: Prisma.CompanyFindFirstArgs) {
    const database = await this.database.softDelete();
    return await database.company.findFirst({
      ...args,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return await this.database.$transaction(async (tx) => {
      {
        return await tx.company.update({
          where: { id },
          data: updateCompanyDto,
        });
      }
    });
  }

  async remove(id: number) {
    const database = await this.database.softDelete();
    return await database.$transaction(async (tx) => {
      return await tx.company.delete({
        where: { id },
      });
    });
  }

  async restore(id: number) {
    return await this.database.$transaction(async (tx) => {
      return await tx.company.update({
        where: { id, deletedAt: { not: null } },
        data: {
          deletedAt: null,
        },
      });
    });
  }
}