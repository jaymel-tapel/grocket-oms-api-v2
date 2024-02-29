import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProspectTemplateDto } from './create-template.dto';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { DoesExist } from '@src/common/validators/user.validation';

export class UpdateProspectTemplateDto extends PartialType(
  CreateProspectTemplateDto,
) {}

export class UpdateProspectsOrderByDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @ApiProperty({ isArray: true, type: Number, example: [2, 5, 1] })
  @Transform(({ value }) => {
    const parsedValue = JSON.parse(value);

    // Ensure the parsed value is an array
    if (Array.isArray(parsedValue)) {
      return parsedValue;
    }

    return [];
  })
  newProspectIds: number[];
}
