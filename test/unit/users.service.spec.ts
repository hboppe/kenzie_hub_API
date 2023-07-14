import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/users/users.service';
import { UserRepository } from '../../src/modules/users/repositories/users.repository';
import { CreateUserDTO } from '../../src/modules/users/dto/create-user.dto';
import { BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { createUserMock } from '../mocks/createUser.mock';


describe('UsersService', () => {
  let service: UsersService;
  let repository: UserRepository

  const users = [
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

  const validUserReturnMock = {
    id: '6a76df3e-2647-4d63-845f-77651206efc9',
    name: 'User1',
    email: 'email1@email.com',
    bio: 'Bio1',
    contact: '5406789078',
    password: 'Senh@123',
    module: 'module 1'
  }

  const invalidCreateUserMock = {
    name: 'Hanna',
    email: 'haha@email.com',
    password: 'senha@E123',
    bio: 'bio aqui'
  } as CreateUserDTO

  const validCreateUserMock = {
    name: 'Hanna',
    email: 'novoemail33dd@email.com',
    password: 'senha@E123',
    bio: 'bio aqui',
    contact: "5404507083",
    module: "Modulo 1"
  }

  const validUserId = 'c16df54c-201a-11ee-be56-0242ac120002'
  const invalidUserId = 'c16df54c-201a-11ee-be56-0242ac120003'

  const updateUser = {
    name: 'update Name',
    bio: 'updated bio'
  }

  const updateUserWithEmailMock = {
    name: 'update Name',
    bio: 'updated bio',
    email: 'email@email.com'
  }

  const updateUserWithPasswordMock = {
    name: 'update Name',
    bio: 'updated bio',
    password: 'updatedpassword@123'
  }


  const validEmail = 'valid@email.com'
  const invalidEmail = 'invalid@email.com'

  const invalidUserIdMock = 'bsdckjsvhjk22'

  const repositoryMock = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  } 


  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: UserRepository, useFactory: () => repositoryMock }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UserRepository>(UserRepository)
  });

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('Create user', () => {

    it('Error - Should throw ConflictException if email already exists', async () => {

      (repository.findByEmail as jest.Mock).mockResolvedValue(createUserMock.duplicatedEmail)

      await expect(service.create(createUserMock.duplicatedEmail)).rejects.toThrow(
        new ConflictException('Email already exists'),
      )
      expect(repository.findByEmail).toBeCalledWith(createUserMock.duplicatedEmail.email)
    })

    it('Error - Should throw if repository throws', async () => {

      (repository.create as jest.Mock).mockRejectedValue(
        new InternalServerErrorException()
      )

      expect(service.create(createUserMock.invalidInfo)).rejects.toThrow()
    })

    it('Success - Should return the data when repository returns data', async () => {

      repositoryMock.create.mockReturnValue(createUserMock.createdUser)

      await expect(service.create(createUserMock.validInfo)).resolves.toBe(createUserMock.createdUser)

    })

    it('Success - Should call repository with correct params', async () => {
      (repository.create as jest.Mock).mockReturnValue(createUserMock.createdUser)

      await service.create(createUserMock.validInfo)

      expect(repository.findByEmail).toBeCalledWith(createUserMock.validInfo.email)
      expect(repository.create).toBeCalledWith(createUserMock.validInfo)
    })

  })

  describe('Retrieve All users', () => {

    it('Success - Should return the data if repository returns data', async () => {
      (repository.findAll as jest.Mock).mockReturnValue(users)
      const allUsers = await service.findAll()

      expect(await service.findAll()).toBe(users)
      expect(repository.findAll).toBeCalled()
    })

    it('Error - Should throw if repository throws', async () => {

      (repository.findAll as jest.Mock).mockRejectedValue(
        new InternalServerErrorException()
      )

      expect(service.findAll()).rejects.toThrow()
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

      (repository.findOne as jest.Mock).mockReturnValue(validUserReturnMock)

      await expect(service.findOne(validUserId)).resolves.toStrictEqual(validUserReturnMock)
      expect(repository.findOne).toBeCalledWith(validUserId)

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

    it('should throw ConflictException error if email informed already exists', async () => {
      
      (repository.findOne as jest.Mock).mockReturnValue(validUserReturnMock);
      (repository.findByEmail as jest.Mock).mockReturnValue(validUserReturnMock);


      await expect(service.update(validUserId, updateUserWithEmailMock)).rejects.toThrow(
        new ConflictException('Email already exists')
      )
      expect(repository.findByEmail).toBeCalledTimes(1)
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

      (repository.findByEmail as jest.Mock).mockResolvedValue(users[0])

      await expect(service.findByEmail(validEmail)).resolves.toStrictEqual(users[0])
      expect(repository.findByEmail).toBeCalledWith(validEmail)

    })

    it('should return null if email doesnt exist', async () => {

      (repository.findByEmail as jest.Mock).mockReturnValue(null)

      expect(await service.findByEmail(invalidEmail)).toBeNull()
      expect(repository.findByEmail).toBeCalledWith(invalidEmail)
    })
  });
});
