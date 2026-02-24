import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

const userPublicSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  timezone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          fullName: dto.fullName.trim(),
          phone: dto.phone?.trim(),
          timezone: dto.timezone?.trim() || 'UTC',
          role: UserRole.CLIENT,
        },
        select: userPublicSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already registered.');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: userPublicSelect,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  findAuthById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async setRefreshTokenHash(userId: string, refreshToken: string) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async clearRefreshTokenHash(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }
}
