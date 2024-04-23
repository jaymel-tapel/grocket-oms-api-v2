import { CreateParticipantDto } from '@modules/participants/dto/create-participant.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsArray()
  @Type(() => CreateParticipantDto)
  @ApiProperty({ type: [CreateParticipantDto] })
  receivers: CreateParticipantDto[];
}
