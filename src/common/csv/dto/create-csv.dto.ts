import { Prisma } from '@prisma/client';
import { IsValidPrismaTable } from '@src/common/validators/prismaTables.validation';
import { IsNotEmpty, IsOptional } from 'class-validator';
import _ from 'lodash';

export type TableNameTypes = Prisma.TypeMap['meta']['modelProps'];

export class CreateCSVDto {
  @IsOptional()
  file: Express.Multer.File;

  @IsNotEmpty()
  @IsValidPrismaTable()
  table: TableNameTypes;
}
