import { FilterUserEnum } from '@modules/users/dto/filter-user.dto';
import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsCorrectTypeForEachEnumConstraint
  implements ValidatorConstraintInterface
{
  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    let keyword = args.object['keyword'];

    console.log(keyword);

    // Convert string value to number if the enum key is 'ID'
    if (
      value === FilterUserEnum.ID &&
      typeof value === 'string' &&
      !isNaN(parseInt(keyword))
    ) {
      keyword = parseInt(args.object['keyword']);
    }

    if (value === FilterUserEnum.ID && typeof keyword === 'number') {
      return true;
    } else if (value === FilterUserEnum.EMAIL && typeof keyword === 'string') {
      return true;
    }

    return false;
  }

  defaultMessage?(args?: ValidationArguments): string {
    const objectKey = Object.keys(args.object)[0];
    const value = args.value;

    console.log(args, objectKey);

    if (value === FilterUserEnum.ID) {
      return `${objectKey} should be a number`;
    } else {
      return `${objectKey} should be a string`;
    }
  }
}

// decorator function
export function IsCorrectTypeForEachEnum(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCorrectTypeForEachEnumConstraint,
    });
  };
}
