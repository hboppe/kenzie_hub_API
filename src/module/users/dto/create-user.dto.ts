import {IsEmail, IsNotEmpty, IsNumberString, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, MinLength} from 'class-validator'

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