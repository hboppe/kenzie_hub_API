import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/users/users.service';
import { UserRepository } from '../../src/modules/users/repositories/users.repository';
import { CreateUserDTO } from '../../src/modules/users/dto/create-user.dto';
import { BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { User } from '../../src/modules/users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDTO } from '../../src/modules/users/dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UserRepository
  let users: User[]
  let invalidCreateUserMock: CreateUserDTO
  let validCreateUserMock: CreateUserDTO
  let updateUser: UpdateUserDTO
  let invalidUserIdMock: string

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

    invalidCreateUserMock = {
      name: 'Hanna',
      email: 'haha@email.com',
      password: 'senha@E123',
      bio: 'bio aqui'
    } as CreateUserDTO

    validCreateUserMock = {
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

    invalidUserIdMock = 'bsdckjsvhjk22'

    const userRepositoryMock = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } 

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: UserRepository, useFactory: () => userRepositoryMock }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UserRepository>(UserRepository)
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('Create user', () => {

    it('should throw ConflictException if email already exists', async () => {

      (repository.findByEmail as jest.Mock).mockResolvedValue(validCreateUserMock.email)

      await expect(service.create(validCreateUserMock)).rejects.toThrow(
        new ConflictException('Email already exists'),
      )
      expect(repository.findByEmail).toBeCalledWith(validCreateUserMock.email)
    })

    it('should return when repository returns', async () => {

      (repository.create as jest.Mock).mockReturnValue(validCreateUserMock)

      await expect(service.create(validCreateUserMock)).resolves.toBe(validCreateUserMock)
      expect(repository.findByEmail).toBeCalledWith(validCreateUserMock.email)
      expect(repository.create).toBeCalledWith(validCreateUserMock)
    })

    it('should throw Error if repository throws', async () => {

      (repository.create as jest.Mock).mockRejectedValue(
        new InternalServerErrorException()
      )

      expect(service.create(validCreateUserMock)).rejects.toThrow(
        new InternalServerErrorException()
      )
    })
  })

  describe('Retrieve All users', () => {

    it('should return if repository returns', async () => {
      (repository.findAll as jest.Mock).mockReturnValue(users)
      const allUsers = await service.findAll()

      expect(await service.findAll()).toBe(users)
      expect(repository.findAll).toBeCalled()
    })

    it('should throw Error if repository throws', async () => {

      (repository.findAll as jest.Mock).mockRejectedValue(
        new InternalServerErrorException()
      )

      expect(service.findAll()).rejects.toThrow(
        new InternalServerErrorException()
      )
    })
    
  })

  describe('Retrieve one user by id', () => {

    it('should throw BadRequestException if user not found', async () => {

      (repository.findOne as jest.Mock).mockReturnValue(null)
      
      await expect(service.findOne(invalidUserIdMock)).rejects.toThrow(
      new BadRequestException('User not found')
     )
     expect(repository.findOne).toBeCalledWith(invalidUserIdMock)
    })
    
    it('should return if repository returns', async () => {

      (repository.findOne as jest.Mock).mockReturnValue({user: 'VALID-USER'})

      expect(await service.findOne('valid-id')).toStrictEqual({user: 'VALID-USER'})
      expect(repository.findOne).toBeCalledWith('valid-id')


    })
  })

  describe('Update User', () => {

    it('should throw BadRequestException if user id is invalid', async () => {

      (repository.findOne as jest.Mock).mockReturnValue(null)

      await expect(service.update(invalidUserIdMock, updateUser)).rejects.toThrow(
        new BadRequestException('User not found')
      )
      expect(repository.findOne).toBeCalledWith(invalidUserIdMock)
    })

    it('should return if repository return', async () => {
      (repository.findOne as jest.Mock).mockReturnValue('VALID-ID');

      (repository.update as jest.Mock).mockReturnValue({user: 'UPDATED-USER'})

      await expect(service.update('VALID-ID', updateUser)).resolves.toStrictEqual({user: 'UPDATED-USER'})
      expect(repository.findOne).toBeCalledWith('VALID-ID')
      expect(repository.update).toBeCalledWith('VALID-ID', updateUser)

    })
  })

  describe('Delete user', () => {

    it('should throw BadRequestException if user not found', async () => {

      await expect(service.delete(invalidUserIdMock)).rejects.toThrow(
        new BadRequestException('User not found')
      )
      expect(repository.findOne).toBeCalledWith(invalidUserIdMock)
    })

    it('should returns if repository returns', async () => {

      (repository.findOne as jest.Mock).mockReturnValue('valid-user')
    
      await expect(service.delete('valid-id')).resolves.toBeUndefined()
      expect(repository.delete).toBeCalledWith('valid-id')
      expect(repository.findOne).toBeCalledWith('valid-id')
      expect(repository.delete('valid-id')).toBeUndefined()
    })
  })

  describe('Retrieve user by email', () => {
    
    it('should return user if email exists', async () => {

      (repository.findByEmail as jest.Mock).mockResolvedValue({user: 'VALID-USER'})

      await expect(service.findByEmail('USER@EMAIL.COM')).resolves.toStrictEqual({user: 'VALID-USER'})
      expect(repository.findByEmail).toBeCalledWith('USER@EMAIL.COM')

    })

    it('should return null if email doesnt exist', async () => {

      (repository.findByEmail as jest.Mock).mockReturnValue(null)

      expect(await service.findByEmail('INVALID@EMAIL.COM')).toBeNull()
      expect(repository.findByEmail).toBeCalledWith('INVALID@EMAIL.COM')
    })
  });
});
