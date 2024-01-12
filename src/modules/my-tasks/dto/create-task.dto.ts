import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  @ApiProperty()
  title: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  remarks?: string;

  @IsOptional()
  @IsEmail()
  @DoesExist({ tableName: 'client', column: 'email' })
  @ApiPropertyOptional()
  client_email?: string;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional()
  task_date?: Date;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  note?: string;

  // TODO: orderId
}
