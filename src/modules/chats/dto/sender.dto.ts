import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export enum AppEnum {
  OMS = 'OMS',
  OCP = 'OCP',
}

export class SenderDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}
