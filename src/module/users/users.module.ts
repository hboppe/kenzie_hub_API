import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './repositories/users.repository';
import { UserRepositoryInMemory } from './repositories/in-memory/users.in-memory.repository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService, 
    {
      provide: UserRepository,
      useClass: UserRepositoryInMemory
    }
  ]
})
export class UsersModule {}
