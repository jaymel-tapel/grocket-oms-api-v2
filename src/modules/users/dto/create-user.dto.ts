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
  @ApiProperty()
  name: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ minLength: 8 })
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
