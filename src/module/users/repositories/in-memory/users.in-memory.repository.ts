import { CreateUserDTO } from '../../dto/create-user.dto';
import { UpdateUserDTO } from '../../dto/update-user.dto';
import { User } from '../../entities/user.entity';
import { UserRepository } from '../users.repository';

export class UserRepositoryInMemory implements UserRepository {
  private dataBase: User[] = []

  create(userData: CreateUserDTO): User | Promise<User> {
    const newUser = new User()
    Object.assign(newUser, {...userData})
    this.dataBase.push(newUser)

    return newUser
  }

  findAll(): User[] | Promise<User[]> {
    return this.dataBase
  }

  findOne(userId: string): User | Promise<User> {
    const foundUser = this.dataBase.find(user => user.id === userId)
    return foundUser
  }

  update(userId: string, updatedData: UpdateUserDTO): User | Promise<User> {
    const userIndex = this.dataBase.findIndex(user => user.id === userId)
    const updatedUser = Object.assign(this.dataBase[userIndex], updatedData)
    return updatedUser
  }

  delete(userId: string): void | Promise<void> {
    const userIndex = this.dataBase.findIndex(user => user.id === userId)
    this.dataBase.slice(userIndex, 1)
    return 
  }
}