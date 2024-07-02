import { TableNameTypes } from '@src/common/types/prisma-table.types';
import { IsValidPrismaTable } from '@src/common/validators/prismaTables.validation';
import { IsNotEmpty, IsOptional } from 'class-validator';
import _ from 'lodash';

export class CreateCSVDto {
  @IsOptional()
  file: Express.Multer.File;

  @IsNotEmpty()
  @IsValidPrismaTable()
  table: TableNameTypes;
}
