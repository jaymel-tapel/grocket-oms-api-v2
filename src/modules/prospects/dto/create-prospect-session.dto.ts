import { ToBoolean } from '@src/common/helpers/toBoolean';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { CreateProspectDto } from './create-prospect.dto';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProspectSession {
  @IsString()
  keyword: string;

  @IsString()
  location: string;

  @IsNumber()
  limit: number;

  @IsNumber()
  count: number;

  @ToBoolean()
  hasWebsites: boolean;

  @IsArray()
  @Type(() => CreateProspectDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [CreateProspectDto] })
  @Transform(({ value }) => {
    const parsedValue = JSON.parse(value);

    // Ensure the parsed value is an array
    if (Array.isArray(parsedValue)) {
      return parsedValue.map((item) => new CreateProspectDto(item));
    }

    return [];
  })
  prospects: CreateProspectDto[];
}
