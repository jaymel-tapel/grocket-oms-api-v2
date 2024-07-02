import { PartialType } from '@nestjs/swagger';
import { CreateCSVDto } from './create-csv.dto';

export class UpdateCSVDto extends PartialType(CreateCSVDto) {}
