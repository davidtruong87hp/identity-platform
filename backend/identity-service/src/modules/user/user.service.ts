import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateUserDto) {
    return this.userRepository.create(dto);
  }

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findByEmailVerifyToken(token: string) {
    return this.userRepository.findByEmailVerifyToken(token);
  }

  async update(id: string, dto: Prisma.UserUpdateInput) {
    return this.userRepository.update(id, dto);
  }

  async delete(id: string) {
    return this.userRepository.delete(id);
  }
}
