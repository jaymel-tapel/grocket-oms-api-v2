import {
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { CreateOrderClientDto, CreateOrderDto } from './create-order.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentStatusEnum } from '@prisma/client';
import { DoesExist } from '@src/common/validators/user.validation';

export class UpdateOrderDto extends PartialType(
  OmitType(CreateOrderDto, [
    'orderReviews',
    'company_name',
    'company_url',
  ] as const),
) {
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  @ApiPropertyOptional()
  payment_status?: PaymentStatusEnum;
}

export class UpdateOrderClientInfoDto extends PartialType(
  CreateOrderClientDto,
) {}

export class UpdateOrderCompanyDto extends PartialType(
  PickType(CreateOrderDto, ['company_name', 'company_url'] as const),
) {
  @IsOptional()
  @DoesExist({ tableName: 'company', column: 'id' })
  @ApiPropertyOptional({
    description:
      'If company_name or company_url is defined, then pass this also',
  })
  company_id?: number;
}

export class UpdateOrderCombinedDto {
  updateOrder: UpdateOrderDto;
  updateClientInfo: UpdateOrderClientInfoDto;
  updateCompany: UpdateOrderCompanyDto;
}

export class UpdateOrderCombinedEntity extends IntersectionType(
  UpdateOrderDto,
  UpdateOrderClientInfoDto,
  UpdateOrderCompanyDto,
) {}
