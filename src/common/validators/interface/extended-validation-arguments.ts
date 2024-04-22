import { UserEntity } from '@modules/users/entities/user.entity';
import { REQUEST_CONTEXT } from '@src/common/interceptors/inject-user.interceptor';
import { ValidationArguments } from 'class-validator';

export interface ExtendedValidationArguments extends ValidationArguments {
  object: {
    [REQUEST_CONTEXT]: {
      user: UserEntity;
    };
  };
}
