import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum ClientSearchEnum {
  SELLER = 'seller',
}

export class FindManyClientsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  keyword?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  clientLoggedIn?: boolean;

  @IsOptional()
  @IsEnum(ClientSearchEnum)
  @ApiPropertyOptional()
  filter?: ClientSearchEnum;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional({ type: Date })
  from?: Date;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional()
  to?: Date;
}
