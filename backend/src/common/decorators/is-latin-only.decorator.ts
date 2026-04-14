import { registerDecorator, ValidationOptions, ValidationArguments, Matches } from 'class-validator';

export function IsNickname(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNickName',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must contain only letters, numbers, and spaces, with no leading or trailing spaces`;
        },
      },
    });
  };
}
