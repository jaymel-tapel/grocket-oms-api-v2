import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { $Enums } from '@prisma/client';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
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
  @IsNumber()
  @DoesExist({ tableName: 'order', column: 'id' })
  @ApiPropertyOptional()
  orderId?: number;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional()
  task_date?: Date;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  note?: string;

  @IsOptional()
  @IsEnum($Enums.CreatedByEnum)
  @ApiHideProperty()
  createdBy?: $Enums.CreatedByEnum;

  @IsOptional()
  @IsEnum($Enums.TaskTypeEnum)
  @ApiHideProperty()
  taskType?: $Enums.TaskTypeEnum;
}
