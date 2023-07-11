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

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll()
  }

  async findOne(id: string) {
    const existingUser = await this.usersRepository.findOne(id)
    if(!existingUser) throw new BadRequestException('User not found')

    return existingUser
  }

  async update(id: string, updatedData: UpdateUserDTO) {

    let existingUser = await this.usersRepository.findOne(id)
    if(!existingUser) throw new BadRequestException('User not found')

    if(updatedData.email){

      existingUser = await this.usersRepository.findByEmail(updatedData.email)
      if(existingUser) throw new ConflictException('Email already exists')
    }
    
    return this.usersRepository.update(id, updatedData)
  }

  async delete(id: string) {

    const existingUser = await this.usersRepository.findOne(id)
    if(!existingUser) throw new BadRequestException('User not found')

    return this.usersRepository.delete(id)
  }

  async findByEmail(email: string): Promise<User> {
    const existingUser: User = await this.usersRepository.findByEmail(email)

    return existingUser
  }

}
