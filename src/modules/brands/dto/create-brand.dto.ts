import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrencyEnum } from '@prisma/client';
import { DoesExist } from '@src/common/validators/user.validation';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  code: string;

  @IsOptional()
  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  logo: Express.Multer.File;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @ApiPropertyOptional()
  address?: string;

  @IsEnum(CurrencyEnum)
  @ApiProperty({ enum: CurrencyEnum })
  currency: CurrencyEnum;
}
