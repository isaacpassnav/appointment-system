import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TenantRole, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(dto: SignUpDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered.');
    }

    const user = await this.usersService.create(dto);
    const tenantName = dto.tenantName?.trim() || `${user.fullName} Workspace`;
    const tenantSlug =
      dto.tenantSlug?.trim() || this.slugifyTenantName(tenantName);

    if (!tenantSlug) {
      throw new BadRequestException('tenantSlug is required.');
    }

    const existingTenant = await this.usersService.findTenantBySlug(tenantSlug);
    if (existingTenant) {
      throw new ConflictException('Tenant slug already exists.');
    }

    const tenant = await this.usersService.ensureTenantForSignup({
      userId: user.id,
      tenantName,
      tenantSlug,
    });

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      globalRole: user.role,
      tenantId: tenant.id,
      tenantRole: TenantRole.BUSINESS_ADMIN,
    });

    await this.usersService.setRefreshTokenHash(user.id, tokens.refreshToken);
    return { user, ...tokens };
  }

  async signIn(dto: SignInDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const tenantContext = await this.resolveTenantContext(user, dto.tenantId);

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      globalRole: user.role,
      tenantId: tenantContext.tenantId,
      tenantRole: tenantContext.tenantRole,
    });
    await this.usersService.setRefreshTokenHash(user.id, tokens.refreshToken);

    const publicUser = await this.usersService.findOne(user.id);
    return { user: publicUser, ...tokens };
  }

  async refresh(dto: RefreshTokenDto) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is required.');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        dto.refreshToken,
        {
          secret: refreshSecret,
        },
      );
    } catch {
      throw new UnauthorizedException('Refresh token is not valid.');
    }

    const user = await this.usersService.findAuthById(payload.sub);
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }

    const validRefreshHash = await bcrypt.compare(
      dto.refreshToken,
      user.refreshTokenHash,
    );

    if (!validRefreshHash) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }

    if (!payload.tenantId) {
      throw new UnauthorizedException('Refresh token is missing tenant context.');
    }

    const tenantContext = await this.resolveTenantContext(user, payload.tenantId);

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      globalRole: user.role,
      tenantId: tenantContext.tenantId,
      tenantRole: tenantContext.tenantRole,
    });
    await this.usersService.setRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.clearRefreshTokenHash(userId);
    return { success: true };
  }

  async me(userId: string) {
    return this.usersService.findOne(userId);
  }

  private async issueTokens(payload: JwtPayload) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const accessExpiresIn = this.parseExpiresInToSeconds(
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    );
    const refreshExpiresIn = this.parseExpiresInToSeconds(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    );

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are required.');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async resolveTenantContext(
    user: { id: string; role: UserRole },
    tenantId?: string,
  ): Promise<{ tenantId: string; tenantRole: TenantRole }> {
    const normalizedTenantId = tenantId?.trim();
    const isSuperadmin = this.isSuperadmin(user.role);
    const isReseller = user.role === UserRole.RESELLER;

    if (!normalizedTenantId) {
      const memberships = await this.usersService.listTenantMemberships(user.id);
      if (memberships.length === 1) {
        return {
          tenantId: memberships[0].tenant.id,
          tenantRole: memberships[0].role,
        };
      }

      throw new BadRequestException({
        message: 'tenantId is required.',
        tenants: memberships.map((item) => ({
          id: item.tenant.id,
          name: item.tenant.name,
          slug: item.tenant.slug,
          role: item.role,
        })),
      });
    }

    const membership = await this.usersService.findTenantMembership(
      user.id,
      normalizedTenantId,
    );

    if (membership) {
      if (membership.tenant.status !== 'ACTIVE' && !isSuperadmin) {
        throw new ForbiddenException('Tenant is suspended.');
      }
      return { tenantId: normalizedTenantId, tenantRole: membership.role };
    }

    const tenant = await this.usersService.findTenantById(normalizedTenantId);
    if (!tenant) {
      throw new ForbiddenException('Tenant not found or not accessible.');
    }

    if (tenant.status !== 'ACTIVE' && !isSuperadmin) {
      throw new ForbiddenException('Tenant is suspended.');
    }

    if (isSuperadmin) {
      return { tenantId: normalizedTenantId, tenantRole: TenantRole.BUSINESS_ADMIN };
    }

    if (isReseller && tenant.resellerId === user.id) {
      return { tenantId: normalizedTenantId, tenantRole: TenantRole.BUSINESS_ADMIN };
    }

    throw new ForbiddenException('No access to tenant.');
  }

  private isSuperadmin(role: UserRole) {
    return role === UserRole.SUPERADMIN || role === UserRole.ADMIN;
  }

  private slugifyTenantName(value: string) {
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug.slice(0, 80);
  }

  private parseExpiresInToSeconds(value: string): number {
    const normalized = value.trim().toLowerCase();
    if (/^\d+$/.test(normalized)) {
      return Number(normalized);
    }

    const match = normalized.match(/^(\d+)([smhdw])$/);
    if (!match) {
      throw new Error(`Invalid JWT expiration format: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 60 * 60 * 24,
      w: 60 * 60 * 24 * 7,
    };

    return amount * multipliers[unit];
  }
}
