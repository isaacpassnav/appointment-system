import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, TenantRole, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto, UpdateProfileDto } from './dto/update-profile.dto';

const userPublicSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  timezone: true,
  role: true,
  emailVerified: true,
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
          emailVerified: false,
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

  async createInTenant(tenantId: string, dto: CreateUserDto) {
    const user = await this.create(dto);

    await this.prisma.tenantMember.create({
      data: {
        tenantId,
        userId: user.id,
        role: TenantRole.CLIENT,
        status: 'ACTIVE',
      },
    });

    return user;
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: userPublicSelect,
    });
  }

  findAllForTenant(tenantId: string) {
    return this.prisma.user.findMany({
      where: {
        memberships: {
          some: {
            tenantId,
            status: 'ACTIVE',
          },
        },
      },
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

  async findOneForTenant(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        memberships: {
          some: {
            tenantId,
            status: 'ACTIVE',
          },
        },
      },
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

  listTenantMemberships(userId: string) {
    return this.prisma.tenantMember.findMany({
      where: { userId, status: 'ACTIVE' },
      select: {
        role: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            resellerId: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  findTenantMembership(userId: string, tenantId: string) {
    return this.prisma.tenantMember.findFirst({
      where: {
        userId,
        tenantId,
        status: 'ACTIVE',
      },
      select: {
        role: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            resellerId: true,
          },
        },
      },
    });
  }

  findTenantById(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        resellerId: true,
      },
    });
  }

  findTenantBySlug(slug: string) {
    return this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });
  }

  async ensureTenantForSignup(params: {
    userId: string;
    tenantName: string;
    tenantSlug: string;
    resellerId?: string;
  }) {
    const tenant = await this.prisma.tenant.create({
      data: {
        name: params.tenantName,
        slug: params.tenantSlug,
        resellerId: params.resellerId,
        members: {
          create: {
            userId: params.userId,
            role: TenantRole.BUSINESS_ADMIN,
            status: 'ACTIVE',
          },
        },
      },
      select: { id: true, name: true, slug: true },
    });

    return tenant;
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

  async setEmailVerificationToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationTokenHash: tokenHash,
        emailVerificationTokenExpiresAt: expiresAt,
        emailVerified: false,
      },
    });
  }

  async verifyEmailByTokenHash(tokenHash: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationTokenHash: tokenHash,
        emailVerificationTokenExpiresAt: { gt: new Date() },
      },
      select: { id: true, email: true },
    });

    if (!user) {
      return null;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationTokenExpiresAt: null,
      },
    });

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: Prisma.UserUpdateInput = {};

    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName.trim();
    }
    if (dto.phone !== undefined) {
      data.phone = dto.phone.trim() || null;
    }
    if (dto.timezone !== undefined) {
      data.timezone = dto.timezone.trim();
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data,
        select: userPublicSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found.');
      }
      throw error;
    }
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true, message: 'Password updated successfully.' };
  }
}
