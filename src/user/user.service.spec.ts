import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('../redis/redis.service', () => ({
  RedisService: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);

    mockRedisService.get.mockResolvedValue(null);
    mockRedisService.keys.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('signup', () => {
    it('should create a user with a hashed password and invalidate the cache', async () => {
      const mockCreatedUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createUserDto = {
        name: 'jest',
        email: 'jest@email.com',
        password: 'jest',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await userService.signup(createUserDto);

      expect(result).toEqual({
        message: 'User created with success',
        user: mockCreatedUser,
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'jest',
          email: 'jest@email.com',
          password: 'hashedPassword123',
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('getUser', () => {
    it('should return an existing user', async () => {
      const mockUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const user = await userService.getUser(1);

      expect(user).toEqual(mockUser);
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(userService.getUser(9)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllUsers', () => {
    it('should fetch from the database and cache the result when there is no cache yet', async () => {
      const mockUsers = [
        { id: 1, name: 'jest', email: 'jest@email.com' },
        { id: 2, name: 'teste2', email: 'teste2@email.com' },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      const result = await userService.findAllUsers({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockUsers);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should return from cache without querying the database when cache exists', async () => {
      const cached = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      mockRedisService.get.mockResolvedValue(JSON.stringify(cached));

      const result = await userService.findAllUsers({ page: 1, limit: 10 });

      expect(result).toEqual(cached);
      expect(mockPrismaService.user.findMany).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should throw ForbiddenException if the id does not belong to the requester', async () => {
      const updateUserDto = { name: 'new name' };

      await expect(
        userService.updateUser(updateUserDto, 1, 999),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.user.findFirst).not.toHaveBeenCalled();
    });

    it('should update the user without changing the password', async () => {
      const existingUser = {
        id: 1,
        name: 'old name',
        email: 'old@email.com',
        password: 'hash123',
      };

      const updatedUser = {
        id: 1,
        name: 'new name',
        email: 'new@email.com',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const updateUserDto = { name: 'new name', email: 'new@email.com' };

      const result = await userService.updateUser(updateUserDto, 1, 1);

      expect(result).toEqual({
        message: 'User update successfully.',
        user: updatedUser,
      });
      expect(mockRedisService.del).not.toHaveBeenCalled(); // no keys to delete (keys mocked as [])
    });

    it('should throw BadRequestException when changing the password without providing the current one', async () => {
      const existingUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        password: 'hash123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      const updateUserDto = { password: 'newPassword' };

      await expect(userService.updateUser(updateUserDto, 1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException if the current password is incorrect', async () => {
      const existingUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        password: 'hash123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const updateUserDto = {
        password: 'newPassword',
        currentPassword: 'wrongPassword',
      };

      await expect(userService.updateUser(updateUserDto, 1, 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should update the password when the current password is correct', async () => {
      const existingUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        password: 'hash123',
      };

      const updatedUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashPassword');
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const updateUserDto = {
        password: 'newPassword',
        currentPassword: 'hash123',
      };

      const result = await userService.updateUser(updateUserDto, 1, 1);

      expect(result).toEqual({
        message: 'User update successfully.',
        user: updatedUser,
      });
    });
  });

  describe('deleteUser', () => {
    it("should throw ForbiddenException when trying to delete another user's account", async () => {
      await expect(userService.deleteUser(1, 999)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.user.findFirst).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(userService.deleteUser(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete the own account successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        password: 'hash123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await userService.deleteUser(1, 1);

      expect(result).toEqual({ message: 'User removed successfully' });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { id: true, name: true, email: true },
      });
    });
  });
});
