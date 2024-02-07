import { ApiPropertyOptional } from '@nestjs/swagger';
import { DoesExist } from '@src/common/validators/user.validation';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindClientsBySellerDto {
  @IsOptional()
  @IsNumber()
  @DoesExist({ tableName: 'user', column: 'id' })
  @ApiPropertyOptional()
  sellerId?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  keyword?: string;
}
