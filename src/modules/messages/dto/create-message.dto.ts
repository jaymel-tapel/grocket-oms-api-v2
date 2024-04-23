import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsNumber, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  @DoesExist({ tableName: 'conversation', column: 'id' })
  @ApiProperty()
  conversationId: number;

  @IsString()
  @ApiProperty()
  content: string;

  @IsNumber()
  @ApiProperty()
  @DoesExist({ tableName: 'participant', column: 'id' })
  senderId: number;
}

export class CreateChatMessageDto extends PartialType(
  PickType(CreateMessageDto, ['content']),
) {}
