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
  findByPasswordResetToken: jest.fn(),
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

const mockNotificationClient = {
  emit: jest.fn(),
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
        { provide: 'NOTIFICATION_SERVICE', useValue: mockNotificationClient },
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

  describe('login with redirect', () => {
    it('should throw if redirect URI is not allowed', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'ALLOWED_REDIRECT_URIS') return 'http://localhost:3000';
        return 'mock-value';
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
          redirectUri: 'http://evil.com',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should return redirect url if redirect URI is allowed', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockPrismaService.refreshToken.create.mockResolvedValue({});
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'ALLOWED_REDIRECT_URIS') return 'http://localhost:3000';
        return 'mock-value';
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
        redirectUri: 'http://localhost:3000',
      });

      expect(result).toHaveProperty('redirect');
      expect((result as any).redirect).toContain('http://localhost:3000');
      expect((result as any).redirect).toContain('access_token');
      expect((result as any).redirect).toContain('refresh_token');
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

  describe('logout', () => {
    it('should throw if refresh token is invalid', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(authService.logout('invalid-token')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw if refresh token is already revoked', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'uuid-1',
        token: 'valid-token',
        revokedAt: new Date(),
      });

      await expect(authService.logout('valid-token')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should logout successfully', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'uuid-1',
        token: 'valid-token',
        revokedAt: null,
      });
      mockPrismaService.refreshToken.update.mockResolvedValue({});

      const result = await authService.logout('valid-token');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('forgotPassword', () => {
    it('should return success even if email does not exist', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await authService.forgotPassword(
        'nonexistent@example.com'
      );
      expect(result).toEqual({
        message: 'If that email exists, a reset link has been sent',
      });
    });

    it('should send reset email if user exists', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.update.mockResolvedValue({});

      const result = await authService.forgotPassword('test@example.com');
      expect(result).toEqual({
        message: 'If that email exists, a reset link has been sent',
      });
      expect(mockNotificationClient.emit).toHaveBeenCalledWith(
        'user.password_reset_requested',
        expect.objectContaining({ email: mockUser.email })
      );
    });
  });

  describe('resetPassword', () => {
    it('should throw if token is invalid', async () => {
      mockUserService.findByPasswordResetToken.mockResolvedValue(null);

      await expect(
        authService.resetPassword('invalid-token', 'newpassword123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if token is expired', async () => {
      mockUserService.findByPasswordResetToken.mockResolvedValue({
        ...mockUser,
        passwordResetTokenExp: new Date(Date.now() - 1000),
      });

      await expect(
        authService.resetPassword('expired-token', 'newpassword123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reset password successfully', async () => {
      mockUserService.findByPasswordResetToken.mockResolvedValue({
        ...mockUser,
        passwordResetTokenExp: new Date(Date.now() + 10000),
      });
      mockUserService.update.mockResolvedValue({});

      const result = await authService.resetPassword(
        'valid-token',
        'newpassword123'
      );
      expect(result).toEqual({ message: 'Password reset successfully' });
    });
  });
});
