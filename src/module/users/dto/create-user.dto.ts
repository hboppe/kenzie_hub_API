import {IsEmail, IsNotEmpty, IsNumberString, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, MinLength, Validate} from 'class-validator'
import { DoesItMatchPasswordConstraint } from '../validators/matches-password.validator'

export class CreateUserDTO{
  @IsNotEmpty()
  @MinLength(3)
  @IsString()
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsStrongPassword()
  password: string

  @IsNotEmpty()
  @Validate(DoesItMatchPasswordConstraint)
  confPassword: string

  @IsOptional()
  @IsString()
  bio: string

  @IsNotEmpty()
  @IsNumberString()
  @IsPhoneNumber('US')
  contact: string

  @IsNotEmpty()
  @IsString()
  module: string
}