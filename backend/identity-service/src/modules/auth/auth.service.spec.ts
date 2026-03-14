import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../database/prisma.service';

const mockUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  password: 'hashed-password',
  firstName: 'John',
  lastName: 'Doe',
  isActive: true,
  emailVerifiedAt: new Date(),
  emailVerifyToken: null,
  emailVerifyTokenExp: null,
  passwordResetToken: null,
  passwordResetTokenExp: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  refreshTokens: [],
};

const mockUserService = {
  findByEmail: jest.fn(),
  findByEmailVerifyToken: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockPrismaService = {
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-access-token'),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('mock-value'),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw if email already exists', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should register a new user successfully', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        message: 'Registration successful, please verify your email',
      });
      expect(mockUserService.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if email is not verified', async () => {
      mockUserService.findByEmail.mockResolvedValue({
        ...mockUser,
        emailVerifiedAt: null,
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens on successful login', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('verifyEmail', () => {
    it('should throw if token is invalid', async () => {
      mockUserService.findByEmailVerifyToken.mockResolvedValue(null);

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw if token is expired', async () => {
      mockUserService.findByEmailVerifyToken.mockResolvedValue({
        ...mockUser,
        emailVerifyTokenExp: new Date(Date.now() - 1000),
      });

      await expect(authService.verifyEmail('expired-token')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should verify email successfully', async () => {
      mockUserService.findByEmailVerifyToken.mockResolvedValue({
        ...mockUser,
        emailVerifyTokenExp: new Date(Date.now() + 10000),
      });
      mockUserService.update.mockResolvedValue({});

      const result = await authService.verifyEmail('valid-token');
      expect(result).toEqual({ message: 'Email verified successfully' });
    });
  });
});
