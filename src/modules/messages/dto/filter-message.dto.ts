import { FilterConversationDto } from '@modules/conversations/dto/filter-conversation.dto';
import { ApiProperty } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsNumber } from 'class-validator';

export class FilterMessageDto extends FilterConversationDto {
  @IsNumber()
  @DoesExist({ tableName: 'conversation', column: 'id' })
  @ApiProperty()
  conversationId: number;
}
