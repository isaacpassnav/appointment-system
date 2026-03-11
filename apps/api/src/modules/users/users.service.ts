import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TenantRole, UserRole } from '@prisma/client';
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
}
