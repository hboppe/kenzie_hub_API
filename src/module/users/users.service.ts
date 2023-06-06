import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/users.repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UserRepository) {}

  async create(userData: CreateUserDTO) {
    const newUser = this.usersRepository.create(userData)

    return newUser
  }

  async findAll() {
    const allUsers = this.usersRepository.findAll()

    return allUsers
  }

  async findOne(userId: string) {
    const user = this.usersRepository.findOne(userId)

    return user
  }

  async update(userId: string, updatedData: UpdateUserDTO) {
    const updatedUser = this.usersRepository.update(userId, updatedData)

    return updatedUser
  }

  async delete(userId: string) {
    this.usersRepository.delete(userId)
    return;
  }

}
