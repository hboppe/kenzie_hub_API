import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../modules/users/users.controller';
import { UsersService } from '../../modules/users/users.service';
import { InternalServerErrorException } from '@nestjs/common';
import { createUserMock } from '../mocks/createUser.mock';
import { retrieveUserMock } from '../mocks/retrieveUser.mock';
import { updateUserMock } from '../mocks/updateUser.mock';
import { destroyUserMock } from '../mocks/destroyUser.mock';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be ok', () => {
    expect(controller).toBeDefined();
  });

  describe('POST - Create a user', () => {

    it('Error - Should throw when service throws', async () => {
      (mockUsersService.create as jest.Mock).mockRejectedValue(
        new InternalServerErrorException()
      )
      await expect(controller.create(createUserMock.invalidInfo)).rejects.toThrow()
    });

    it('Success - Should call service with correct params', async () => {
      await controller.create(createUserMock.validInfo)

      expect(mockUsersService.create).toBeCalledWith(createUserMock.validInfo)
    });

    it('Success - Should return when service returns', async () => {
      (mockUsersService.create as jest.Mock).mockReturnValue(createUserMock.createdUser)

      expect(await controller.create(createUserMock.validInfo)).toEqual(createUserMock.createdUser)
    })
  })

  describe('GET - Retrieve all users', () => {

    it('Error - Should throw when service throws', async () => {
      (mockUsersService.findAll as jest.Mock).mockRejectedValue(
        new InternalServerErrorException()
      )

      await expect(controller.findAll()).rejects.toThrow()
    });

    it('Success - Should call service with correct params', async () => {
      await controller.findAll()

      expect(mockUsersService.findAll).toBeCalledWith()
    });

    it('Success - Should return when service returns', async () => {
      (mockUsersService.findAll as jest.Mock).mockReturnValue(retrieveUserMock.allUsers)

      expect(await controller.findAll()).toEqual(retrieveUserMock.allUsers)
    })
  })

  describe('GET:id - Retrieve user by id', () => {

    it('Error - Should throw when service throws', async () => {
      (mockUsersService.findOne as jest.Mock).mockRejectedValue(
        new InternalServerErrorException()
      )

      await expect(controller.findOne(retrieveUserMock.invalidId)).rejects.toThrow()
    });

    it('Success - Should call service with correct params', async () => {
      await controller.findOne(retrieveUserMock.validId)

      expect(mockUsersService.findOne).toBeCalledWith(retrieveUserMock.validId)
    });

    it('Success - Should return when service returns', async () => {
      (mockUsersService.findOne as jest.Mock).mockReturnValue(retrieveUserMock.validUser)

      expect(await controller.findOne(retrieveUserMock.validId)).toEqual(retrieveUserMock.validUser)
    })
  })

  describe('PATCH:id - Update user', () => {

    it('Error - Should throw when service throws', async () => {
      (mockUsersService.update as jest.Mock).mockRejectedValue(
        new InternalServerErrorException()
      )

      await expect(controller.update(updateUserMock.invalidId, updateUserMock.duplicatedEmail)).rejects.toThrow()
    });

    it('Success - Should call service with correct params', async () => {
      await controller.update(updateUserMock.validId, updateUserMock.validUpdate)

      expect(mockUsersService.update).toBeCalledWith(updateUserMock.validId, updateUserMock.validUpdate)
    });

    it('Success - Should return when service returns', async () => {
      (mockUsersService.update as jest.Mock).mockReturnValue(updateUserMock.updatedUser)

      expect(await controller.update(updateUserMock.validId, updateUserMock.validUpdate)).toEqual(updateUserMock.updatedUser)
    })
  })

  describe('DELETE:id - Delete user', () => {

    it('Error - Should throw when service throws', async () => {
      (mockUsersService.delete as jest.Mock).mockRejectedValue(
        new InternalServerErrorException()
      )

      await expect(controller.delete(destroyUserMock.invalidId)).rejects.toThrow()
    });

    it('Success - Should call service with correct params', async () => {
      await controller.delete(destroyUserMock.validId)

      expect(mockUsersService.delete).toBeCalledWith(destroyUserMock.validId)
    });

    it('Success - Should return when service returns', async () => {
      (mockUsersService.delete as jest.Mock).mockReturnValue(undefined)

      expect(await controller.delete(destroyUserMock.validId)).toEqual(undefined)
    })
  })
});
