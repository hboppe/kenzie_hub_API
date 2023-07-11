import { Test, TestingModule } from "@nestjs/testing"
import { PrismaService } from "../../database/prisma.service"
import { HashingService } from "../../src/modules/users/hashing.service"
import { UserPrismaRepository } from "../../src/modules/users/repositories/prisma/users.prisma.repository"
import { InternalServerErrorException } from "@nestjs/common"
import { CreateUserDTO } from '../../src/modules/users/dto/create-user.dto';
import { User } from "../../src/modules/users/entities/user.entity"

describe('UserRepository', () => {

  let repository: UserPrismaRepository
  let prisma: PrismaService
  let hashing: HashingService

  const prismaMock = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }

  const hashingMock = {
    hashPassword: jest.fn()
  }

  const createUserMock: CreateUserDTO = {
    name: 'name-test',
    email: 'email@email.com',
    password: 'password@123',
    bio: 'bio-test',
    contact: 'contact-test',
    module: 'module-test'
  }

  const expectedUsers = [
    {
      id: '3416455a-2015-11ee-be56-0242ac120002',
      name: 'name-test',
      email: 'email@email.com',
      password: 'password@123',
      bio: 'bio-test',
      contact: 'contact-test',
      module: 'module-test'
    },
    {
      id: '3416483e-2015-11ee-be56-0242ac120002',
      name: 'name-test',
      email: 'email2@email.com',
      password: 'password@123',
      bio: 'bio-test',
      contact: 'contact-test',
      module: 'module-test'
    }
  ];

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPrismaRepository,
        {
          provide: PrismaService,
          useValue: prismaMock
        },
        {
          provide: HashingService,
          useValue: hashingMock
        }
      ]
    }).compile()

    repository = module.get<UserPrismaRepository>(UserPrismaRepository)
    prisma = module.get<PrismaService>(PrismaService)
    hashing = module.get<HashingService>(HashingService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(repository).toBeDefined
  })

  describe('create', () => {

    const hashedPassword = 'hashedPassword'
    
    it('should throw if prisma throws', async () => {
      (prisma.user.create as jest.Mock).mockRejectedValue(
        new InternalServerErrorException()
      )

      expect(repository.create(createUserMock)).rejects.toThrow(
        new InternalServerErrorException()
      )
      expect(prisma.user.create).toBeCalledTimes(1)
    })

    it('should call hashing with right parameters', async () => {
      await repository.create(createUserMock)

      expect(hashing.hashPassword).toBeCalledTimes(1)
      expect(hashing.hashPassword).toBeCalledWith(createUserMock.password, 10)
    })

    it('should call prisma create with hashed password', async () => {
      (hashing.hashPassword as jest.Mock).mockReturnValue(hashedPassword)

      await repository.create(createUserMock)

      expect(prisma.user.create).toBeCalledWith({
        data: expect.objectContaining({
          password: hashedPassword
        })
      })
    })

    it('should return an instance of User', async () => {
      
      (hashing.hashPassword as jest.Mock).mockReturnValue(hashedPassword)
      prismaMock.user.create.mockResolvedValue(createUserMock)

      const result = await repository.create(createUserMock)
      expect(prisma.user.create).toBeCalledTimes(1)
      expect(result).toBeInstanceOf(User)
    
    })

    it('should not contain the password in the returned User', async () => {

      (hashing.hashPassword as jest.Mock).mockReturnValue(hashedPassword)
      prismaMock.user.create.mockResolvedValue(createUserMock)

      const result = await repository.create(createUserMock)

      expect(result).not.toHaveProperty('password')

    })
    
    it('should call prisma with the right params', async () => {

      (hashing.hashPassword as jest.Mock).mockReturnValue(hashedPassword)

      await repository.create(createUserMock)

      expect(prisma.user.create).toBeCalledWith({
        data: expect.objectContaining({
          name: createUserMock.name,
          password: hashedPassword,
          email: createUserMock.email,
          bio: createUserMock.bio,
          contact: createUserMock.contact,
          module: createUserMock.module
        })
      })
    })
  });

  describe('findAll', () => {


    it('should throw if prisma throws', async () => {

      prismaMock.user.findMany.mockRejectedValue(
        new InternalServerErrorException()
      )

      await expect(repository.findAll()).rejects.toThrow(
        new InternalServerErrorException()
      )
    })

    it('should return instances of User', async () => {

      (prisma.user.findMany as jest.Mock).mockReturnValue(expectedUsers)

      const result = await repository.findAll()
      expect(result[0]).toBeInstanceOf(User)

    })

    it('should not return password', async () => {
      (prisma.user.findMany as jest.Mock).mockReturnValue(expectedUsers)

      const result = await repository.findAll()

      expect(result[0]).not.toHaveProperty('password')
    })
  })

  describe('findOne', () => {

    const userId = 'c16df54c-201a-11ee-be56-0242ac120002'

    it('should throw if prisma throws', async () => {

      prismaMock.user.findUnique.mockRejectedValue(
        new InternalServerErrorException()
      )

      await expect(repository.findOne(createUserMock.email)).rejects.toThrow(
        new InternalServerErrorException()
      )
      expect(prisma.user.findUnique).toBeCalledTimes(1)
    })

    it('should call prisma with the right params', async () => {

      await repository.findOne(userId)

      expect(prisma.user.findUnique).toBeCalledWith({
        where: { id: userId }
      })
    })

    it('should return an instance of User', async () => {
      prismaMock.user.findUnique.mockResolvedValue(expectedUsers[0])

      const result = await repository.findOne(userId)
      expect(result).toBeInstanceOf(User)
    })

    it('should not include the user\'s password', async () =>{
      prismaMock.user.findUnique.mockResolvedValue(expectedUsers[0])

      const result = await repository.findOne(userId)

      expect(result).not.toHaveProperty('password')
    })
  })

  describe('findByEmail', () => {

    const email = 'email@email.com'
    
    it('should throw if prisma throws', async () => {
      prismaMock.user.findUnique.mockRejectedValue(
        new InternalServerErrorException()
      )

      await expect(repository.findByEmail(email)).rejects.toThrow(
        new InternalServerErrorException()
      )
    })

    it('should call prisma with valid parameters', async () => {
      
      await repository.findByEmail(email)

      expect(prisma.user.findUnique).toBeCalledTimes(1)
      expect(prisma.user.findUnique).toBeCalledWith({
        where: {email}
      })
    })

    it('should returns when prisma return', async () => {
      prismaMock.user.findUnique.mockResolvedValue(expectedUsers[0])

      await expect(repository.findByEmail(email)).resolves.toEqual(expectedUsers[0])
      expect(prisma.user.findUnique).toBeCalledWith({
        where: {email}
      })
    })

  })
})