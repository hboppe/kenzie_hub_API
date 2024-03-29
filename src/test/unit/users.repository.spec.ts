import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../database/prisma.service';
import { HashingService } from '../../modules/users/hashing.service';
import { UserPrismaRepository } from '../../modules/users/repositories/prisma/users.prisma.repository';
import { InternalServerErrorException } from '@nestjs/common';
import { User } from '../../modules/users/entities/user.entity';
import { UpdateUserDTO } from 'src/modules/users/dto/update-user.dto';
import { createUserMock } from '../mocks/createUser.mock';
import { CreateUserDTO } from 'src/modules/users/dto/create-user.dto';

describe('UserRepository', () => {
  let repository: UserPrismaRepository;
  let prisma: PrismaService;
  let hashing: HashingService;

  const prismaMock = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const hashingMock = {
    hashPassword: jest.fn(),
  };

  const validUserReturnMock = {
    id: '6a76df3e-2647-4d63-845f-77651206efc9',
    name: 'User1',
    email: 'email1@email.com',
    bio: 'Bio1',
    contact: '5406789078',
    password: 'Senh@123',
    module: 'module 1',
  };

  const expectedUsers = [
    {
      id: '3416455a-2015-11ee-be56-0242ac120002',
      name: 'name-test',
      email: 'email@email.com',
      password: 'password@123',
      bio: 'bio-test',
      contact: 'contact-test',
      module: 'module-test',
    },
    {
      id: '3416483e-2015-11ee-be56-0242ac120002',
      name: 'name-test',
      email: 'email2@email.com',
      password: 'password@123',
      bio: 'bio-test',
      contact: 'contact-test',
      module: 'module-test',
    },
  ];

  const updatedDataWithNoEmailOrPasswordMock: UpdateUserDTO = {
    name: 'new-name',
    bio: 'new-bio',
  };

  const updateUserWithPasswordMock = {
    name: 'new name',
    password: 'newPassword@123',
  };

  const hashedPassword = 'hashedPassword';

  const userId = 'c16df54c-201a-11ee-be56-0242ac120002';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPrismaRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: HashingService,
          useValue: hashingMock,
        },
      ],
    }).compile();

    repository = module.get<UserPrismaRepository>(UserPrismaRepository);
    prisma = module.get<PrismaService>(PrismaService);
    hashing = module.get<HashingService>(HashingService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Success - Should be defined', () => {
    expect(repository).toBeDefined;
  });

  describe('create', () => {
    it('Error - Should throw if prisma throws', async () => {
      (prisma.user.create as jest.Mock).mockRejectedValue(new InternalServerErrorException());

      expect(repository.create(createUserMock.validInfo)).rejects.toThrow();
    });

    it('Success - Should call hashing with right parameters', async () => {
      await repository.create(createUserMock.validInfo);

      expect(hashing.hashPassword).toBeCalledTimes(1);
      expect(hashing.hashPassword).toBeCalledWith(createUserMock.validInfo.password, 10);
    });

    it('Success - Should call prisma create with hashed password', async () => {
      (hashing.hashPassword as jest.Mock).mockReturnValue(createUserMock.hashedPassword);

      await repository.create(createUserMock.validInfo);

      expect(prisma.user.create).toBeCalledWith({
        data: expect.objectContaining({
          password: createUserMock.hashedPassword,
        }),
      });
    });

    it('Success - Should return an instance of User', async () => {
      (hashing.hashPassword as jest.Mock).mockReturnValue(createUserMock.hashedPassword);
      (prisma.user.create as jest.Mock).mockResolvedValue(createUserMock.createdUser);

      const result = await repository.create(createUserMock.validInfo);
      expect(prisma.user.create).toBeCalledTimes(1);
      expect(result).toBeInstanceOf(User);
    });

    it('Success - Should not contain the password in the returned User', async () => {
      (hashing.hashPassword as jest.Mock).mockReturnValue(createUserMock.hashedPassword);
      prismaMock.user.create.mockResolvedValue(createUserMock.createdUser);

      const result = await repository.create(createUserMock.validInfo);
      expect(result).not.toHaveProperty('password');
    });

    it('Success - Should call prisma with the right params', async () => {
      (hashing.hashPassword as jest.Mock).mockReturnValue(createUserMock.hashedPassword);

      await repository.create(createUserMock.validInfo);

      expect(prisma.user.create).toBeCalledWith({
        data: expect.objectContaining({
          name: createUserMock.validInfo.name,
          password: createUserMock.hashedPassword,
          email: createUserMock.validInfo.email,
          bio: createUserMock.validInfo.bio,
          contact: createUserMock.validInfo.contact,
          module: createUserMock.validInfo.module,
        }),
      });
    });
  });

  describe('findAll', () => {
    it('Error - Should throw when prisma throws', async () => {
      prismaMock.user.findMany.mockRejectedValue(new InternalServerErrorException());

      await expect(repository.findAll()).rejects.toThrow();
    });

    it('should return instances of User', async () => {
      (prisma.user.findMany as jest.Mock).mockReturnValue(expectedUsers);

      const result = await repository.findAll();
      expect(result[0]).toBeInstanceOf(User);
    });

    it('should not return password', async () => {
      (prisma.user.findMany as jest.Mock).mockReturnValue(expectedUsers);

      const result = await repository.findAll();

      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('should throw if prisma throws', async () => {
      prismaMock.user.findUnique.mockRejectedValue(new InternalServerErrorException());

      await expect(repository.findOne(createUserMock.invalidInfo.email)).rejects.toThrow(
        new InternalServerErrorException(),
      );
      expect(prisma.user.findUnique).toBeCalledTimes(1);
    });

    it('should call prisma with the right params', async () => {
      await repository.findOne(userId);

      expect(prisma.user.findUnique).toBeCalledWith({
        where: { id: userId },
      });
    });

    it('should return an instance of User', async () => {
      prismaMock.user.findUnique.mockResolvedValue(expectedUsers[0]);

      const result = await repository.findOne(userId);
      expect(result).toBeInstanceOf(User);
    });

    it("should not include the user's password", async () => {
      prismaMock.user.findUnique.mockResolvedValue(expectedUsers[0]);

      const result = await repository.findOne(userId);

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findByEmail', () => {
    const email = 'email@email.com';

    it('should throw if prisma throws', async () => {
      prismaMock.user.findUnique.mockRejectedValue(new InternalServerErrorException());

      await expect(repository.findByEmail(email)).rejects.toThrow(
        new InternalServerErrorException(),
      );
    });

    it('should call prisma with valid parameters', async () => {
      await repository.findByEmail(email);

      expect(prisma.user.findUnique).toBeCalledTimes(1);
      expect(prisma.user.findUnique).toBeCalledWith({
        where: { email },
      });
    });

    it('should returns if prisma return', async () => {
      prismaMock.user.findUnique.mockResolvedValue(expectedUsers[0]);

      await expect(repository.findByEmail(email)).resolves.toEqual(expectedUsers[0]);
      expect(prisma.user.findUnique).toBeCalledWith({
        where: { email },
      });
      expect(prisma.user.findUnique).toReturn();
    });
  });

  describe('update', () => {
    it('should throw if prisma throws', async () => {
      prismaMock.user.update.mockRejectedValue(new InternalServerErrorException());

      await expect(repository.update(userId, updatedDataWithNoEmailOrPasswordMock)).rejects.toThrow(
        new InternalServerErrorException(),
      );
    });

    it('should call prisma with valid parameters', async () => {
      await repository.update(userId, updatedDataWithNoEmailOrPasswordMock);

      expect(prisma.user.update).toBeCalledWith({
        where: { id: userId },
        data: { ...updatedDataWithNoEmailOrPasswordMock },
      });
      expect(prisma.user.update).toBeCalledTimes(1);
    });

    it('should call hashing if password is informed', async () => {
      const originalPassword = updateUserWithPasswordMock.password;
      hashingMock.hashPassword.mockReturnValue(hashedPassword);

      await repository.update(userId, updateUserWithPasswordMock);
      expect(hashing.hashPassword).toBeCalledWith(originalPassword, 10);
    });

    it('should not call hashing if password is not informed', async () => {
      await repository.update(userId, updatedDataWithNoEmailOrPasswordMock);
      expect(hashing.hashPassword).not.toBeCalled();
    });

    it('should return an instance of User', async () => {
      hashingMock.hashPassword.mockReturnValue(hashedPassword);
      prismaMock.user.update.mockReturnValue(validUserReturnMock);

      await expect(repository.update(userId, updateUserWithPasswordMock)).resolves.toBeInstanceOf(
        User,
      );
    });

    it("should not return user's password", async () => {
      hashingMock.hashPassword.mockReturnValue(hashedPassword);
      prismaMock.user.update.mockReturnValue(validUserReturnMock);

      await expect(
        repository.update(userId, updateUserWithPasswordMock),
      ).resolves.not.toHaveProperty('password');
    });
  });

  describe('delete', () => {
    it('should throw if prisma throws', async () => {
      prismaMock.user.delete.mockRejectedValue(new InternalServerErrorException());

      await expect(repository.delete(userId)).rejects.toThrow(new InternalServerErrorException());
    });

    it('should returns if prisma returns', async () => {
      prismaMock.user.delete.mockResolvedValue(validUserReturnMock);

      await repository.delete(userId);
      expect(prisma.user.delete).toReturn();
    });
  });
});
