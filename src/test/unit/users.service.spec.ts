import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../modules/users/users.service';
import { UserRepository } from '../../modules/users/repositories/users.repository';
import { CreateUserDTO } from '../../modules/users/dto/create-user.dto';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createUserMock } from '../mocks/createUser.mock';
import { retrieveUserMock } from '../mocks/retrieveUser.mock';
import { updateUserMock } from '../mocks/updateUser.mock';
import { destroyUserMock } from '../mocks/destroyUser.mock';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UserRepository;

  beforeEach(async () => {
    const repositoryMock = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: UserRepository, useFactory: () => repositoryMock }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('Create user', () => {
    it('Error - Should throw ConflictException if email already exists', async () => {
      (repository.findByEmail as jest.Mock).mockResolvedValue(createUserMock.duplicatedEmail);

      await expect(service.create(createUserMock.duplicatedEmail)).rejects.toThrow(
        new ConflictException('Email already exists'),
      );
      expect(repository.findByEmail).toBeCalledWith(createUserMock.duplicatedEmail.email);
    });

    it('Error - Should throw if repository throws', async () => {
      (repository.create as jest.Mock).mockRejectedValue(new InternalServerErrorException());

      expect(service.create(createUserMock.invalidInfo)).rejects.toThrow();
    });

    it('Success - Should return the data when repository returns data', async () => {
      (repository.create as jest.Mock).mockReturnValue(createUserMock.createdUser);

      await expect(service.create(createUserMock.validInfo)).resolves.toBe(
        createUserMock.createdUser,
      );
    });

    it('Success - Should call repository with correct params', async () => {
      (repository.create as jest.Mock).mockReturnValue(createUserMock.createdUser);

      await service.create(createUserMock.validInfo);

      expect(repository.findByEmail).toBeCalledWith(createUserMock.validInfo.email);
      expect(repository.create).toBeCalledWith(createUserMock.validInfo);
    });
  });

  describe('Retrieve All users', () => {
    it('Error - Should throw if repository throws', async () => {
      (repository.findAll as jest.Mock).mockRejectedValue(new InternalServerErrorException());

      expect(service.findAll()).rejects.toThrow();
    });

    it('Success - Should return the data if repository returns data', async () => {
      (repository.findAll as jest.Mock).mockReturnValue(retrieveUserMock.allUsers);

      expect(await service.findAll()).toBe(retrieveUserMock.allUsers);
    });

    it('Success - Should call repository with correct params', async () => {
      await service.findAll();

      expect(repository.findAll).toBeCalled();
      expect(repository.findAll).toBeCalledWith();
    });
  });

  describe('Retrieve one user by id', () => {
    it('Error - Should throw BadRequestException if user not found', async () => {
      (repository.findAll as jest.Mock).mockReturnValue(null);

      await expect(service.findOne(retrieveUserMock.invalidId)).rejects.toThrow(
        new BadRequestException('User not found'),
      );
    });

    it('Success - Should return the data if repository returns data', async () => {
      (repository.findOne as jest.Mock).mockReturnValue(retrieveUserMock.validUser);

      await expect(service.findOne(retrieveUserMock.validUser.id)).resolves.toStrictEqual(
        retrieveUserMock.validUser,
      );
    });

    it('Success - Should call repository with correct params', async () => {
      (repository.findOne as jest.Mock).mockReturnValue(retrieveUserMock.validUser);

      await service.findOne(retrieveUserMock.validUser.id);
      expect(repository.findOne).toBeCalledTimes(1);
      expect(repository.findOne).toBeCalledWith(retrieveUserMock.validUser.id);
    });
  });

  describe('Update User', () => {
    it('Error - Should throw BadRequestException if user is not found', async () => {
      (repository.findOne as jest.Mock).mockReturnValue(null);

      await expect(
        service.update(updateUserMock.invalidId, updateUserMock.validUpdate),
      ).rejects.toThrow(new BadRequestException('User not found'));
    });

    it('Error - Should throw if repository throws', async () => {
      (repository.findOne as jest.Mock).mockReturnValue(retrieveUserMock.validUser);
      (repository.update as jest.Mock).mockRejectedValue(new InternalServerErrorException());

      await expect(
        service.update(retrieveUserMock.validUser.id, updateUserMock.validUpdate),
      ).rejects.toThrow();
    });

    it('Error - Should throw ConflictException error if email informed already exists', async () => {
      (repository.findOne as jest.Mock).mockReturnValue(retrieveUserMock.validUser);
      (repository.findByEmail as jest.Mock).mockReturnValue(retrieveUserMock.validUser.email);

      await expect(
        service.update(updateUserMock.validId, updateUserMock.duplicatedEmail),
      ).rejects.toThrow(new ConflictException('Email already exists'));
    });

    it('Success - Should return the data if repository returns data', async () => {
      (repository.findOne as jest.Mock).mockReturnValue(retrieveUserMock.validUser);
      (repository.update as jest.Mock).mockReturnValue(updateUserMock.updatedUser);

      await expect(
        service.update(updateUserMock.validId, updateUserMock.updatedUser),
      ).resolves.toStrictEqual(updateUserMock.updatedUser);
    });

    it('Success - Should call repository with correct params', async () => {
      (repository.findOne as jest.Mock).mockReturnValue(retrieveUserMock.validUser);
      (repository.findByEmail as jest.Mock).mockReturnValue(null);

      await service.update(updateUserMock.validId, updateUserMock.validUpdate);

      expect(repository.findOne).toBeCalledWith(updateUserMock.validId);
      expect(repository.findByEmail).toBeCalledWith(updateUserMock.validUpdate.email);
    });
  });

  describe('Delete user', () => {
    it('Error - Should throw BadRequestException if user not found', async () => {
      (repository.findOne as jest.Mock).mockReturnValue(null);

      await expect(service.delete(updateUserMock.invalidId)).rejects.toThrow(
        new BadRequestException('User not found'),
      );
    });

    it('Error - Should throws if repository throw', async () => {
      (repository.findOne as jest.Mock).mockReturnValue(destroyUserMock.validUser);
      (repository.delete as jest.Mock).mockRejectedValue(new InternalServerErrorException());

      await expect(service.delete(destroyUserMock.invalidUser.id)).rejects.toThrow();
    });

    it('Success - Should returns if repository returns', async () => {
      (repository.findOne as jest.Mock).mockReturnValue('valid-user');

      await expect(service.delete('valid-id')).resolves.toBeUndefined();
      expect(repository.delete).toReturn();
    });

    it('Success - Should call repository with correct params', async () => {
      (repository.findOne as jest.Mock).mockReturnValue(destroyUserMock.validUser);

      await service.delete(destroyUserMock.validUser.id);

      expect(repository.findOne).toBeCalledWith(destroyUserMock.validUser.id);
      expect(repository.delete).toBeCalledWith(destroyUserMock.validUser.id);
    });
  });

  describe('Retrieve user by email', () => {
    it('Success - Should return user if email exists', async () => {
      (repository.findByEmail as jest.Mock).mockResolvedValue(retrieveUserMock.validUser);

      await expect(service.findByEmail(retrieveUserMock.validUser.email)).resolves.toStrictEqual(
        retrieveUserMock.validUser,
      );
      expect(repository.findByEmail).toBeCalledWith(retrieveUserMock.validUser.email);
    });

    it('Success - Should return null if email doesnt exist', async () => {
      (repository.findByEmail as jest.Mock).mockReturnValue(null);

      expect(await service.findByEmail(retrieveUserMock.invalidEmail)).toBeNull();
      expect(repository.findByEmail).toBeCalledWith(retrieveUserMock.invalidEmail);
    });

    it('Success - Should call repository with correct params', async () => {
      (repository.findByEmail as jest.Mock).mockReturnValue(retrieveUserMock.validUser);

      await service.findByEmail(retrieveUserMock.validUser.email);

      expect(repository.findByEmail).toBeCalledWith(retrieveUserMock.validUser.email);
    });
  });
});
