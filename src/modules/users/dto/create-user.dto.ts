import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, RoleEnum } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto implements Prisma.UserCreateInput {
  @IsString()
  @MinLength(3)
  @ApiProperty()
  name: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsEnum(RoleEnum)
  @ApiProperty({ enum: RoleEnum })
  role: RoleEnum;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ nullable: true })
  contact_url?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ nullable: true })
  phone?: string;
}
