import { CreateUserDTO } from '../../dto/create-user.dto';
import { UpdateUserDTO } from '../../dto/update-user.dto';
import { User } from '../../entities/user.entity';
import { UserRepository } from '../users.repository';
import * as path from 'path';
import * as fs from 'fs/promises'
import { Injectable } from '@nestjs/common';

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
    const newUser = new User()
    Object.assign(newUser, {...userData})

    if(Array.isArray(this.dataBase["users"])) this.dataBase["users"].push(newUser)
    else this.dataBase["users"] = [newUser]
    this.persist()
    return newUser
  }

  findAll(): User[] | Promise<User[]> | [] {
    return this.dataBase["users"] || []
  }

  findOne(id: string): User | Promise<User> {
    const user = this.dataBase["users"].find(user => user.id === id)
    return user
  }

  update(id: string, updatedData: UpdateUserDTO): User | Promise<User> {
    const userIndex = this.dataBase["users"].findIndex(user => user.id === id)
    const updatedUser = Object.assign(this.dataBase["users"][userIndex], updatedData)
    this.persist()

    return updatedUser
  }

  delete(userId: string): void | Promise<void> {
    const userIndex = this.dataBase["users"].findIndex(user => user.id === userId)
    this.dataBase["users"].splice(userIndex, 1)
    this.persist()
    return 
  }
}