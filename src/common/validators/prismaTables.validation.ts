import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { TableNameTypes } from '../types/prisma-table.types';
import { Prisma } from '@prisma/client';
import _ from 'lodash';

const modelNames = Object.values(Prisma.ModelName);
export const FormattedModelNames = modelNames.map((modelName) =>
  _.lowerFirst(modelName),
);

@Injectable()
@ValidatorConstraint({ async: false })
export class IsValidPrismaTableConstraint
  implements ValidatorConstraintInterface
{
  validate(value: TableNameTypes, args?: ValidationArguments) {
    return FormattedModelNames.includes(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `Invalid table value. Expected values are: ${FormattedModelNames.join(
      ', ',
    )}`;
  }
}

// decorator function
export function IsValidPrismaTable(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPrismaTableConstraint,
    });
  };
}
