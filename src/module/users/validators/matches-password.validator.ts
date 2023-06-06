import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ async: false })
export class DoesItMatchPasswordConstraint implements ValidatorConstraintInterface {
  validate(confPassword: string, validationArguments?: ValidationArguments): boolean {
    return confPassword === (validationArguments.object as any)['password']
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Password and confirm password must match'
  }
}