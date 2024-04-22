import { UserEntity } from '@modules/users/entities/user.entity';
import { ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsAlreadyExist } from '@src/common/validators/isAlreadyExist.validation';
import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsEmail()
  @IsAlreadyExist({ tableName: 'user', column: 'email' })
  @ApiPropertyOptional({ format: 'email' })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  phone?: string;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional()
  contact_url?: string;

  @IsEmail({}, { each: true })
  @ApiPropertyOptional({ isArray: true, example: ['user@example.com'] })
  alternateEmails?: string[];

  // This property won't be validated but can be accessed for custom logic
  @IsOptional()
  @ApiHideProperty()
  _requestContext?: UserEntity;
}
