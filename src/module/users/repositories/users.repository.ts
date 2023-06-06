import { CreateUserDTO } from "../dto/create-user.dto";
import { UpdateUserDTO } from "../dto/update-user.dto";
import { User } from "../entities/user.entity";

export abstract class UserRepository{
  abstract create(userData: CreateUserDTO): Promise<User> | User
  abstract findAll(): Promise<User[]> | User[]
  abstract findOne(userId: string): Promise<User> | User
  abstract update(userId: string, updatedData: UpdateUserDTO): Promise<User> | User
  abstract delete(userId: string): Promise<void> | void
}