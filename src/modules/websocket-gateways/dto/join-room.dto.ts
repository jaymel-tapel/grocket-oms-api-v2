import { DoesExist } from '@src/common/validators/user.validation';
import { IsNumber } from 'class-validator';

export class JoinRoomDto {
  @IsNumber()
  @DoesExist({ tableName: 'conversation', column: 'id' })
  conversationId: number;
}
