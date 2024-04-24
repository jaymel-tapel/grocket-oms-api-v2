import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ async: true })
export class ConfirmPasswordConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    const [field] = args.constraints;
    const relatedValue = args.object[field];

    if (value !== relatedValue) {
      return false;
    }

    return true;
  }
  defaultMessage?(args?: ValidationArguments): string {
    const [field] = args.constraints;

    return `${field} and ${args.property} should be match`;
  }
}

// decorator function
export function IsSameAs<T>(options: T, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: ConfirmPasswordConstraint,
    });
  };
}
