import { ApiProperty } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsNumber } from 'class-validator';

export class FilterMessageDto {
  @IsNumber()
  @DoesExist({ tableName: 'conversation', column: 'id' })
  @ApiProperty()
  conversationId: number;
}
