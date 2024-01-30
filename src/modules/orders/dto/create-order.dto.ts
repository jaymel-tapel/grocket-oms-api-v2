import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateOrderReviewDto } from './create-order-review.dto';
import { Type } from 'class-transformer';
import { DoesExist } from '@src/common/validators/user.validation';
import { CreateClientDto } from '@modules/clients/dto/create-client.dto';

export class CreateOrderDto {
  @IsEmail()
  @ApiProperty()
  seller_email: string;

  @IsString()
  @MinLength(3)
  @ApiProperty()
  seller_name: string;

  @IsEmail()
  @ApiProperty()
  client_email: string;

  @IsString()
  @MinLength(3)
  @ApiProperty()
  client_name: string;

  @IsString()
  @MinLength(2)
  @ApiProperty()
  company_name: string;

  @IsUrl()
  @ApiProperty()
  company_url: string;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional({ nullable: true })
  order_date?: Date;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  send_confirmation?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  unit_cost?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  remarks?: string;

  @IsNotEmpty()
  @Type(() => CreateOrderReviewDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: CreateOrderReviewDto, isArray: true })
  orderReviews: CreateOrderReviewDto[];

  @IsOptional()
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    required: false,
  })
  file?: Express.Multer.File;
}

export class CreateOrderClientDto extends OmitType(CreateClientDto, [
  'default_unit_cost',
  'password',
  'sentOffer',
  'name',
  'email',
  'sellerId',
]) {
  @IsNumber()
  @DoesExist({ tableName: 'clientSource', column: 'id' })
  @ApiProperty()
  sourceId: number;

  @IsOptional()
  @DoesExist({ tableName: 'clientIndustry', column: 'id' })
  @ApiPropertyOptional()
  industryId?: number;

  @IsNumber()
  @DoesExist({ tableName: 'brand', column: 'id' })
  @ApiProperty()
  brandId: number;
}

export class CreateOrderEntity extends IntersectionType(
  CreateOrderDto,
  CreateOrderClientDto,
) {}