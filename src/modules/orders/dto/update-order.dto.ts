import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { CreateOrderClientDto, CreateOrderDto } from './create-order.dto';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PaymentStatusEnum } from '@prisma/client';
import { DoesExist } from '@src/common/validators/user.validation';

export class UpdateOrderDto extends OmitType(CreateOrderDto, [
  'orderReviews',
  'company_name',
  'company_url',
] as const) {
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  @ApiPropertyOptional()
  payment_status?: PaymentStatusEnum;

  @IsNumber()
  @DoesExist({ tableName: 'company', column: 'id' })
  @ApiProperty({
    description:
      'If company_name or company_url is defined, then pass this also',
  })
  companyId: number;
}

export class UpdateOrderClientInfoDto extends PartialType(
  OmitType(CreateOrderClientDto, ['brandId', 'sourceId'] as const),
) {
  @IsNotEmpty()
  @DoesExist({ tableName: 'clientSource', column: 'id' })
  @ApiProperty()
  sourceId: number;

  @IsNotEmpty()
  @DoesExist({ tableName: 'brand', column: 'id' })
  @ApiProperty()
  brandId: number;
}

export class UpdateOrderCombinedDto {
  updateOrder: UpdateOrderDto;
  updateClientInfo: UpdateOrderClientInfoDto;
}

export class UpdateOrderCombinedEntity extends IntersectionType(
  UpdateOrderDto,
  UpdateOrderClientInfoDto,
) {}
