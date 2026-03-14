import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UserService } from '../user/user.service';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const emailVerifyToken = randomUUID();
    const emailVerifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
      emailVerifyToken,
      emailVerifyTokenExp,
    });

    this.notificationClient.emit('user.registered', {
      email: user.email,
      firstName: user.firstName ?? user.email.split('@')[0] ?? '',
      token: emailVerifyToken,
    });

    return { message: 'Registration successful, please verify your email' };
  }

  async login(
    dto: LoginDto
  ): Promise<
    { accessToken: string; refreshToken: string } | { redirect: string }
  > {
    if (dto.redirectUri) {
      const allowedUris = this.configService
        .get<string>('ALLOWED_REDIRECT_URIS')!
        .split(',')
        .map((uri) => uri.trim());

      if (!allowedUris.includes(dto.redirectUri)) {
        throw new BadRequestException('Invalid redirect URI');
      }
    }

    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Please verify your email first');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    if (dto.redirectUri) {
      const redirectUrl = new URL(dto.redirectUri);
      redirectUrl.searchParams.set('access_token', tokens.accessToken);
      redirectUrl.searchParams.set('refresh_token', tokens.refreshToken);

      return { redirect: redirectUrl.toString() };
    }

    return tokens;
  }

  async verifyEmail(token: string) {
    const user = await this.userService.findByEmailVerifyToken(token);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.emailVerifyTokenExp && user.emailVerifyTokenExp < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.userService.update(user.id, {
      emailVerifiedAt: new Date(),
      emailVerifyToken: null,
      emailVerifyTokenExp: null,
    });

    return { message: 'Email verified successfully' };
  }

  async refreshToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken || refreshToken.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // revoke old token
    await this.prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.generateTokens(
      refreshToken.user.id,
      refreshToken.user.email
    );

    return tokens;
  }

  private async generateTokens(userId: string, email: string) {
    const payload: JwtPayload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_EXPIRES_IN'
      ) as JwtSignOptions['expiresIn'],
    });

    const refreshTokenValue = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshTokenValue,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  async logout(refreshToken: string) {
    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!token || token.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: token.id },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);

    // always return success to prevent email enumeration
    if (!user) {
      return { message: 'If that email exists, a reset link has been sent' };
    }

    const passwordResetToken = randomUUID();
    const passwordResetTokenExp = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await this.userService.update(user.id, {
      passwordResetToken,
      passwordResetTokenExp,
    });

    this.notificationClient.emit('user.password_reset_requested', {
      email: user.email,
      firstName: user.firstName ?? user.email,
      token: passwordResetToken,
    });

    return { message: 'If that email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userService.findByPasswordResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    if (user.passwordResetTokenExp && user.passwordResetTokenExp < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExp: null,
    });

    return { message: 'Password reset successfully' };
  }
}
