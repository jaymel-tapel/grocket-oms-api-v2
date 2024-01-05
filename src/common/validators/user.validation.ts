import { DatabaseService } from '@modules/database/services/database.service';
import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

type ITable = {
  tableName: string;
  column: string;
};

@Injectable()
@ValidatorConstraint({ async: true })
export class DoesExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly database: DatabaseService) {}
  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    const { tableName, column }: ITable = args.constraints[0];

    const doesExist = await this.database[tableName].findFirst({
      where: { [column]: value },
    });

    if (!doesExist) {
      return false;
    }

    return true;
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    // ? It will return a custom field message
    let field: string = validationArguments.property;

    if (field.includes('email')) {
      field = validationArguments.value;
    }

    return `${field} does not exist`;
  }
}

// decorator function
export function DoesExist(
  options: ITable,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: DoesExistConstraint,
    });
  };
}
