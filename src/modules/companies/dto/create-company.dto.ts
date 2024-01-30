import { ApiProperty } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsNumber()
  @DoesExist({ tableName: 'client', column: 'id' })
  @ApiProperty()
  clientId: number;

  @IsString()
  @MinLength(3)
  @ApiProperty()
  name: string;

  @IsUrl()
  @ApiProperty()
  url: string;
}
