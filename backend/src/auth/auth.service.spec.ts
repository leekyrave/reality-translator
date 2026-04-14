import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/core';
import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { User } from '@/libs/orm/entities';

const mockUser = {
  id: 'uuid-123',
  email: 'test@test.com',
  name: 'testuser',
  password: 'hashed',
  verifyPassword: jest.fn(),
};

const mockEm = {
  create: jest.fn(),
  persist: jest.fn().mockReturnThis(),
  flush: jest.fn(),
  findOne: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('jwt-token'),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: EntityManager, useValue: mockEm },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user and return token', async () => {
      mockEm.create.mockReturnValue(mockUser);
      mockEm.persist.mockReturnValue({ flush: mockEm.flush });

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        name: 'testuser',
      });

      expect(mockEm.create).toHaveBeenCalledWith(User, {
        email: 'test@test.com',
        password: 'password123',
        name: 'testuser',
      });
      expect(result).toEqual({ token: 'jwt-token' });
    });

    it('should throw ConflictException on duplicate email', async () => {
      mockEm.create.mockReturnValue(mockUser);
      mockEm.persist.mockReturnValue({
        flush: jest.fn().mockRejectedValue(new UniqueConstraintViolationException(new Error())),
      });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
          name: 'testuser',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException on unknown error', async () => {
      mockEm.create.mockReturnValue(mockUser);
      mockEm.persist.mockReturnValue({
        flush: jest.fn().mockRejectedValue(new Error('Unknown')),
      });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
          name: 'testuser',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login and return token', async () => {
      mockUser.verifyPassword.mockResolvedValue(true);
      mockEm.findOne.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'test@test.com',
        name: 'testuser',
        password: 'password123',
      });

      expect(result).toEqual({ token: 'jwt-token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockEm.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'wrong@test.com',
          name: 'wrong',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      mockUser.verifyPassword.mockResolvedValue(false);
      mockEm.findOne.mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: 'test@test.com',
          name: 'testuser',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException on db error', async () => {
      mockEm.findOne.mockRejectedValue(new Error('DB error'));

      await expect(
        service.login({
          email: 'test@test.com',
          name: 'testuser',
          password: 'password123',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('signJwt', () => {
    it('should return signed token', () => {
      const result = service.signJwt({ sub: 'uuid-123', email: 'test@test.com' });
      expect(result).toEqual({ token: 'jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'uuid-123',
        email: 'test@test.com',
      });
    });
  });
});
