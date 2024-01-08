import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, Validate } from 'class-validator';

export abstract class FilterDto<T extends string | number> {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  keyword?: string;

  @IsOptional()
  @Validate((value: any, object: any) => isEnumValid(value, object))
  @ApiPropertyOptional()
  filter?: T;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional({ type: Date })
  from?: Date;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional()
  to?: Date;
}

function isEnumValid(value: any, object: any): boolean {
  if (!object || !object.constructor || !object.constructor.name) {
    return false;
  }

  console.log([value, object]);
  const enumValues = Object.values(object.constructor.name);
  return enumValues.includes(value);
}
