import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/users/users.service';
import { UserPrismaRepository } from '../../src/modules/users/repositories/prisma/users.prisma.repository';
import { PrismaService } from '../../database/prisma.service';
import { UserRepository } from '../../src/modules/users/repositories/users.repository';
import { CreateUserDTO } from '../../src/modules/users/dto/create-user.dto';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService, { provide: UserRepository, useValue: mockUserRepository }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('Create user', () => {
    const createUserMissingFields = {
      name: 'Hanna',
      email: 'haha@email.com',
      password: 'senha@E123',
      bio: 'bio aqui'
    } as CreateUserDTO

    const createUserValidInfos = {
      name: 'Hanna',
      email: 'novoemail33dd@email.com',
      password: 'senha@E123',
      bio: 'bio aqui',
      contact: "5404507083",
      module: "Modulo 1"
    }

    it('should throw ConflictException if email already exists', async () => {

      mockUserRepository.findByEmail.mockResolvedValue(true)

      await expect(service.create(createUserValidInfos)).rejects.toThrow(
        new ConflictException('Email already exists'),
      )
      expect(mockUserRepository.findByEmail).toBeCalledWith(createUserValidInfos.email)
    })

    it('should return user if called with valid params', async () => {

      const {password, ...user} = createUserValidInfos

      mockUserRepository.findByEmail.mockResolvedValue(false)
      mockUserRepository.create.mockResolvedValue({
        ...user,
        id: "6a76df3e-2647-4d63-845f-77651206efc9"
      })
      const newUser = await service.create(createUserValidInfos)

      expect(newUser).toMatchObject({
        ...user,
        id: "6a76df3e-2647-4d63-845f-77651206efc9"
      })

      expect(mockUserRepository.findByEmail).toBeCalled()
      expect(mockUserRepository.create).toBeCalledWith(createUserValidInfos)

    })
  })
});
