import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class ClientDto {
  @IsString()
  @MinLength(3)
  @ApiProperty({ minLength: 3 })
  name: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @ApiPropertyOptional({ minLength: 8 })
  password?: string;
}

export class ClientInfoDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ default: null })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ default: null })
  thirdPartyId?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  @ApiPropertyOptional({ default: 0.0, type: Number })
  default_unit_cost?: number = 0.0;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  sentOffer?: boolean;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number })
  sourceId: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number })
  industryId?: number;
}

export class CreateClientDto extends IntersectionType(
  ClientDto,
  ClientInfoDto,
) {}
