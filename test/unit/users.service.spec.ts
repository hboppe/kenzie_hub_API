import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/users/users.service';
import { UserRepository } from '../../src/modules/users/repositories/users.repository';
import { CreateUserDTO } from '../../src/modules/users/dto/create-user.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { User } from '../../src/modules/users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDTO } from '../../src/modules/users/dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository
  let users: User[]
  let createUserMissingFields: CreateUserDTO
  let createUserValidInfos: CreateUserDTO
  let updateUser: UpdateUserDTO

  beforeEach(async () => {

    users = [
      {
        id: '6a76df3e-2647-4d63-845f-77651206efc9',
        name: 'User1',
        email: 'email1@email.com',
        bio: 'Bio1',
        contact: '5406789078',
        password: 'Senh@123',
        module: 'module 1'
      },
      {
        id: '6a76df3e-2647-4d63-845f-77651206efc8',
        name: 'User2',
        email: 'email2@email.com',
        bio: 'Bio1',
        contact: '5406789079',
        password: 'Senh@123',
        module: 'module 2'
      }
    ]

    createUserMissingFields = {
      name: 'Hanna',
      email: 'haha@email.com',
      password: 'senha@E123',
      bio: 'bio aqui'
    } as CreateUserDTO

    createUserValidInfos = {
      name: 'Hanna',
      email: 'novoemail33dd@email.com',
      password: 'senha@E123',
      bio: 'bio aqui',
      contact: "5404507083",
      module: "Modulo 1"
    }

    updateUser = {
      name: 'update Name',
      bio: 'new bio'
    }

    const userRepositoryMock = {
      findByEmail: jest.fn().mockImplementation((email:string) => null),
      create: jest.fn().mockImplementation((userInfo) => {
        
        const newUser = new User();
        Object.assign(newUser, userInfo)

        return plainToInstance(User, newUser)
      }),
      findAll: jest.fn().mockImplementation(() => {

        return plainToInstance(User, users)
      }),
      findOne: jest.fn().mockImplementation((id: string) => {
        const user = users.find((user) => user.id === id)

        return user ? plainToInstance(User, user) : null
      }),
      update: jest.fn().mockImplementation((id: string, updateUserData: UpdateUserDTO) => {
        const findUser = users.find(user => user.id === id);
        Object.assign(findUser, updateUserData)

        return plainToInstance(User, findUser)
      }),
      delete: jest.fn().mockImplementation((id: string) => {
        const userIndex = users.findIndex((user) => user.id === id)

        users.splice(userIndex, 1)
        return
      })
    } 

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: UserRepository, useFactory: () => userRepositoryMock }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository)
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('Create user', () => {


    it('should throw ConflictException if email already exists', async () => {

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(createUserValidInfos.email)

      await expect(service.create(createUserValidInfos)).rejects.toThrow(
        new ConflictException('Email already exists'),
      )

      expect(userRepository.findByEmail).toBeCalledWith(createUserValidInfos.email)
    })

    it('should return user if called with valid params', async () => {

      const newUser = await service.create(createUserValidInfos)

      expect(userRepository.findByEmail).toBeCalled()
      expect(userRepository.create).toBeCalledWith(createUserValidInfos)
      expect(newUser).not.toHaveProperty('password')
      expect(newUser).toHaveProperty('id')
      expect(newUser).toHaveProperty('name')
      expect(newUser).toHaveProperty('email')
      expect(newUser).toHaveProperty('bio')
      expect(newUser).toHaveProperty('contact')

    })
  })

  describe('Retrieve All users', () => {
    it('should return an array of users', async () => {
      const users = await service.findAll()

      expect(userRepository.findAll).toBeCalled()
      expect(Array.isArray(users)).toBe(true)
    })

    it('should not return users password', async () => {
      const users = await service.findAll()

      expect(users[0]).not.toHaveProperty('password')
    })

  })

  describe('Retrieve one user by id', () => {

    it('should throw BadRequestException if user not found', async () => {

     await expect(service.findOne('gj5')).rejects.toThrow(
      new BadRequestException('User not found')
     )
     expect(userRepository.findOne).toBeCalled()
     expect(userRepository.findOne).toBeCalledWith('gj5')
    })
    
    it('should return a user if a valid id is passed as argument', async () => {
      const user = await service.findOne(users[0].id)

      expect(userRepository.findOne).toBeCalled()
      expect(user).not.toHaveProperty('password')
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('module')
      expect(user).toHaveProperty('bio')
      expect(user).toHaveProperty('contact')

    })
  })

  describe('Update User', () => {
    it('should throw BadRequestException if user id is invalid', async () => {

      await expect(service.update('gj5', updateUser)).rejects.toThrow(
        new BadRequestException('User not found')
      )
      expect(userRepository.findOne).toBeCalled()
    })

    it('should return user if id and updateUserInfo are valid', async () => {
      const user = await service.update(users[1].id,updateUser)

      expect(userRepository.findOne).toBeCalled()
      expect(userRepository.update).toBeCalledWith(users[1].id, updateUser)
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('name', updateUser.name)
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('bio', updateUser.bio)
      expect(user).toHaveProperty('contact')
      expect(user).not.toHaveProperty('password')
    })
  })

  describe('Delete user', () => {

    it('should throw BadRequestException if user not found', async () => {

      await expect(service.delete('gj5')).rejects.toThrow(
        new BadRequestException('User not found')
      )
      expect(userRepository.findOne).toBeCalled()
    })

    it('should delete user if id is valid', async () => {

      const userToDelete = users[1]

      await expect(service.delete(users[1].id)).resolves.toBeUndefined()
      expect(users.find(user => user.id === userToDelete.id)).toBeUndefined()
      expect(userRepository.delete).toBeCalledTimes(1)
    })
  })

  describe('Retrieve user by email', () => {
    
    it('should return user if email exists', async () => {

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(users[0])

      const user = await service.findByEmail(users[0].email)

      expect(user).toBe(users[0])
      expect(userRepository.findByEmail).toBeCalledTimes(1)
    })

    it('should return null if email doesnt exist', async () => {
      const user = await service.findByEmail(createUserMissingFields.email)

      expect(user).toBeNull()
    })
  });
});
