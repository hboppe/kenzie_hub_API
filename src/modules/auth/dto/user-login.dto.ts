import { IsNotEmpty } from "class-validator"

export class UserLogin {
    
    @IsNotEmpty()
    email: string

    @IsNotEmpty()
    password: string
}