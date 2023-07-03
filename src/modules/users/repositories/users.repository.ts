import { CreateUserDTO } from "../dto/create-user.dto";
import { UpdateUserDTO } from "../dto/update-user.dto";
import { User } from "../entities/user.entity";

export abstract class UserRepository{
  abstract create(userData: CreateUserDTO): Promise<User> | User
  abstract findAll(): Promise<User[]> | User[] | []
  abstract findOne(id: string): Promise<User> | User
  abstract update(id: string, updatedData: UpdateUserDTO): Promise<User> | User
  abstract delete(id: string): Promise<void> | void
  abstract findByEmail(email: string): Promise<User> | User
}