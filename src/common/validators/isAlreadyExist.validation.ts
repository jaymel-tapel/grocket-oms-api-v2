import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { ITable } from './interface/table.interface';
import { ExtendedValidationArguments } from './interface/extended-validation-arguments';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsAlreadyExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly database: DatabaseService) {}
  async validate(
    value: any,
    args?: ExtendedValidationArguments,
  ): Promise<boolean> {
    const database = await this.database.softDelete();

    const { tableName, column }: ITable = args.constraints[0];
    const authUser = args?.object?._requestContext?.user;

    const doesExist = await (database[tableName] as any).findFirst({
      where: { [column]: value },
    });

    if (doesExist && (!authUser || value !== authUser[column])) {
      return false;
    }

    return true;
  }
  defaultMessage?(validationArguments?: ExtendedValidationArguments): string {
    // ? It will return a custom field message
    let field: string = validationArguments.property;

    if (field.includes('email')) {
      field = validationArguments.value;
    }

    return `${field} already exists`;
  }
}

// decorator function
export function IsAlreadyExist(
  options: ITable,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsAlreadyExistConstraint,
    });
  };
}
