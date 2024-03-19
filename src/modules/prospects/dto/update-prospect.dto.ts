import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProspectDto } from './create-prospect.dto';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { DoesExist } from '@src/common/validators/user.validation';
import { Transform, Type } from 'class-transformer';
import { CreateProspectReviewerDto } from './create-prospect-reviewer.dto';

export class UpdateProspectDto extends PartialType(CreateProspectDto) {
  @IsOptional()
  @DoesExist({ tableName: 'prospectTemplate', column: 'id' })
  @ApiPropertyOptional()
  templateId?: number;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  reviews?: number;

  @IsOptional()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    return JSON.parse(value);
  })
  stars?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => CreateProspectReviewerDto)
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    const parsedValue = JSON.parse(value);

    // Ensure the parsed value is an array
    if (Array.isArray(parsedValue)) {
      return parsedValue.map((item) => new CreateProspectReviewerDto(item));
    }

    return [];
  })
  reviewers?: CreateProspectReviewerDto[];
}
