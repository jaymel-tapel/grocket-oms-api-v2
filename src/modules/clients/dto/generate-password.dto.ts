import { ApiProperty } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsNumber, IsString, MinLength } from 'class-validator';

export class SendGeneratedPasswordDto {
  @IsNumber()
  @DoesExist({ tableName: 'client', column: 'id' })
  @ApiProperty()
  clientId: number;

  @IsString()
  @MinLength(8)
  @ApiProperty()
  password: string;
}
