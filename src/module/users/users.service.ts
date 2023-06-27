import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/users.repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UserRepository) {}

  async create(userData: CreateUserDTO) {
    return this.usersRepository.create(userData)
  }

  async findAll() {
    return this.usersRepository.findAll()
  }

  async findOne(id: string) {
    return this.usersRepository.findOne(id)
  }

  async update(id: string, updatedData: UpdateUserDTO) {
    return this.usersRepository.update(id, updatedData)
  }

  async delete(id: string) {
    return this.usersRepository.delete(id)

  }

}
