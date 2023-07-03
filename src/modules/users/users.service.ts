import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/users.repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UserRepository) {}

  async create(userData: CreateUserDTO): Promise<User> {

    const existingUser = await this.usersRepository.findByEmail(userData.email)
    if(existingUser) throw new ConflictException('Email already exists')

    return this.usersRepository.create(userData)
  }

  async findAll() {
    return this.usersRepository.findAll()
  }

  async findOne(id: string) {
    const existingUser = await this.usersRepository.findOne(id)
    if(!existingUser) throw new BadRequestException('User not found')

    return existingUser
  }

  async update(id: string, updatedData: UpdateUserDTO) {

    const existingUser = await this.usersRepository.findOne(id)
    if(!existingUser) throw new BadRequestException('User not found')
    
    return this.usersRepository.update(id, updatedData)
  }

  async delete(id: string) {

    const existingUser = await this.usersRepository.findOne(id)
    if(!existingUser) throw new BadRequestException('User not found')

    return this.usersRepository.delete(id)
  }

}
