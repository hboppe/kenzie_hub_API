import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from '../../dto/create-user.dto';
import { UpdateUserDTO } from '../../dto/update-user.dto';
import { User } from '../../entities/user.entity';
import { UserRepository } from '../users.repository';
import { PrismaService } from '../../../../../database/prisma.service';
import { plainToInstance } from 'class-transformer';
import { HashingService } from '../../hashing.service';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private prisma: PrismaService, private hashing: HashingService) {}

  async create(userData: CreateUserDTO): Promise<User> {
    const user = new User();
    userData.password = this.hashing.hashPassword(userData.password, 10);
    Object.assign(user, userData);
    const newUser = await this.prisma.user.create({
      data: {
        ...user,
      },
    });
    return plainToInstance(User, newUser);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return plainToInstance(User, users);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return plainToInstance(User, user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async update(id: string, updatedData: UpdateUserDTO): Promise<User> {
 
    if(updatedData.password) {
      updatedData.password = this.hashing.hashPassword(updatedData.password, 10)
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { ...updatedData },
    });

    return plainToInstance(User, user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
