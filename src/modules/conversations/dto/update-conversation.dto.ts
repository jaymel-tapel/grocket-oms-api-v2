import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateConversationDto } from './create-conversation.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateConversationDto extends PartialType(CreateConversationDto) {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  participantCount?: number;
}
