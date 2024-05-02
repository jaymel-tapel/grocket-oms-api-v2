import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { DoesExist } from '@src/common/validators/user.validation';

export class CreateRatingsDto {
  @IsNumber()
  @DoesExist({ tableName: 'company', column: 'id' })
  @ApiProperty()
  companyId: number;

  @IsNumber()
  @ApiProperty()
  rating: number;

  @IsNumber()
  @ApiProperty()
  reviews: number;

  @IsNumber()
  @ApiProperty()
  negative_reviews: number;

  @IsOptional()
  @IsNumber({}, { each: true })
  @ApiPropertyOptional()
  stars?: number[];
}
