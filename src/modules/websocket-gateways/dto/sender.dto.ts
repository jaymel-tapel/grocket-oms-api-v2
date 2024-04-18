import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';

export enum AppEnum {
  OMS = 'OMS',
  OCP = 'OCP',
}

export class SenderDto {
  constructor(data?: SenderDto) {
    Object.assign(this, data);
  }

  @IsEnum(AppEnum)
  @ApiProperty({ enum: AppEnum })
  appType: AppEnum;

  @IsEmail()
  @ApiProperty()
  email: string;
}
