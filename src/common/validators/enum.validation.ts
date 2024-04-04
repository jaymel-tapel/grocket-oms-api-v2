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
    let { keyword }: any = args.object;
    const enumType = args.constraints[0];

    // ? Convert string value to number if the enum key is 'ID'
    if (
      value === FilterUserEnum.ID &&
      typeof value === 'string' &&
      !isNaN(parseInt(keyword))
    ) {
      keyword = parseInt(keyword);
    }

    // ? Check if the keyword matches the type for any of the enum values
    for (const enumValue of Object.values(enumType) as string[]) {
      if (
        value === enumValue &&
        typeof keyword === typeof enumValue &&
        value !== 'id'
      ) {
        return true;
      } else if (value === enumValue && typeof keyword === 'number') {
        return true;
      }
    }

    return false;
  }

  defaultMessage?(args?: ValidationArguments): string {
    const objectKey = Object.keys(args.object)[0];
    const value = args.value;

    if (value === FilterUserEnum.ID) {
      return `${objectKey} should be a number`;
    } else {
      return `${objectKey} should be a string`;
    }
  }
}

// decorator function
export function IsCorrectTypeForEachEnum(
  enumType: any,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [enumType],
      validator: IsCorrectTypeForEachEnumConstraint,
    });
  };
}
