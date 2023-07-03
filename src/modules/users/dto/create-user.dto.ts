import { Transform } from 'class-transformer'
import {IsEmail, IsNotEmpty, IsNumberString, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, MinLength} from 'class-validator'
import { hashSync } from 'bcryptjs';


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
  @Transform(({ value }: { value: string }) => hashSync(value, 10), {
    groups: ['transform']
  })
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