import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './repositories/users.repository';
import { UserPrismaRepository } from './repositories/prisma/users.prisma.repository';
import { PrismaService } from 'database/prisma.service';
import { HashingService } from './hashing.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService, 
    PrismaService,
    {
      provide: UserRepository,
      useClass: UserPrismaRepository
    },
    HashingService
  ],
  exports: [UsersService]
})
export class UsersModule {}
