import { CreateUserDTO } from '../../dto/create-user.dto';
import { UpdateUserDTO } from '../../dto/update-user.dto';
import { User } from '../../entities/user.entity';
import { UserRepository } from '../users.repository';
import * as path from 'path';
import * as fs from 'fs/promises'
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { promises } from 'dns';

@Injectable()
export class UserRepositoryInMemory implements UserRepository {
  private dataBase = {}
  private dataBasePath = path.resolve(__dirname, '../../../../../db.json')
  private persist() {
    fs.writeFile(this.dataBasePath, JSON.stringify(this.dataBase))
  }
  
  constructor(){
    fs.readFile(this.dataBasePath, 'utf8')
    .then((data) => {
      this.dataBase = JSON.parse(data)
    }).catch(() => {
      this.persist()
    })
  }

  create(userData: CreateUserDTO): User | Promise<User> {
    const newUser: User = new User()
    Object.assign(newUser, {...userData})

    if(Array.isArray(this.dataBase["users"])) this.dataBase["users"].push(newUser)
    else this.dataBase["users"] = [newUser]
    this.persist()
    return plainToInstance(User, newUser)
  }

  findAll(): User[] | Promise<User[]> {
    const users: User[] = this.dataBase["users"] || []
    return plainToInstance(User, users)
  }

  findOne(id: string): User | Promise<User> {
    const user: User = this.dataBase["users"].find(user => user.id === id)
    return plainToInstance(User, user)
  }

  update(id: string, updatedData: UpdateUserDTO): User | Promise<User> {
    const userIndex = this.dataBase["users"].findIndex(user => user.id === id)
    const updatedUser = Object.assign(this.dataBase["users"][userIndex], updatedData)
    this.persist()

    return plainToInstance(User, updatedUser)
  }

  findByEmail(email: string): User | Promise<User> | undefined{
      const user: User | undefined = this.dataBase["users"].find(user => user.email === email)

      return user
  }

  delete(userId: string): void | Promise<void> {
    const userIndex = this.dataBase["users"].findIndex(user => user.id === userId)
    this.dataBase["users"].splice(userIndex, 1)
    this.persist()
    return 
  }
}