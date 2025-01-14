import { ConfirmPasswordConstraint } from './confirmPassword.validation';
import { IsCorrectTypeForEachEnumConstraint } from './enum.validation';
import { IsAlreadyExistConstraint } from './isAlreadyExist.validation';
import { IsValidPrismaTableConstraint } from './prismaTables.validation';
import { DoesExistConstraint } from './user.validation';

export const ValidatorConstraints = [
  DoesExistConstraint,
  IsAlreadyExistConstraint,
  IsValidPrismaTableConstraint,
  IsCorrectTypeForEachEnumConstraint,
  ConfirmPasswordConstraint,
];
