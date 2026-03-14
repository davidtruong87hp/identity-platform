import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserService } from '../user/user.service';
import { StorageService } from '../storage/storage.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userService: UserService,
    private readonly storageService: StorageService
  ) {}

  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const {
      password,
      emailVerifyToken,
      emailVerifyTokenExp,
      passwordResetToken,
      passwordResetTokenExp,
      ...profile
    } = user;
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userService.update(userId, dto);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ext = file.originalname.split('.').pop();
    const key = `avatars/${userId}/${randomUUID()}.${ext}`;

    const avatarUrl = await this.storageService.uploadFile(
      key,
      file.buffer,
      file.mimetype
    );

    await this.userService.update(userId, { avatarUrl });

    return { avatarUrl };
  }
}
