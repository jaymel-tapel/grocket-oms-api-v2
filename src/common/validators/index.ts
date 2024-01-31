import { IsAlreadyExistConstraint } from './isAlreadyExist.validation';
import { DoesExistConstraint } from './user.validation';

export const ValidatorConstraints = [
  DoesExistConstraint,
  IsAlreadyExistConstraint,
];
