import { CreateParticipantDto } from '@modules/participants/dto/create-participant.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { instanceToPlain, Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

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
