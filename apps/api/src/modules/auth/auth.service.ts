import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TenantRole, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

type TenantMembershipContext = {
  role: TenantRole;
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
    resellerId: string | null;
  };
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
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

    const verificationToken = await this.issueEmailVerificationToken(user.id);

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      globalRole: user.role,
      tenantId: tenant.id,
      tenantRole: TenantRole.BUSINESS_ADMIN,
    });

    await this.usersService.setRefreshTokenHash(user.id, tokens.refreshToken);
    const verifyUrl = this.buildVerifyUrl(verificationToken);
    this.scheduleSignupEmails({
      email: user.email,
      fullName: user.fullName,
      verifyUrl,
    });

    return {
      user: await this.buildSessionUser(
        user.id,
        tenant.id,
        TenantRole.BUSINESS_ADMIN,
      ),
      ...tokens,
    };
  }

  async signIn(dto: SignInDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Email not verified. Please check your inbox and verify your account.',
      );
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

    return {
      user: await this.buildSessionUser(
        user.id,
        tenantContext.tenantId,
        tenantContext.tenantRole,
      ),
      ...tokens,
    };
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

    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Email not verified. Please verify your account before refreshing session.',
      );
    }

    const validRefreshHash = await bcrypt.compare(
      dto.refreshToken,
      user.refreshTokenHash,
    );

    if (!validRefreshHash) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }

    if (!payload.tenantId) {
      throw new UnauthorizedException(
        'Refresh token is missing tenant context.',
      );
    }

    const tenantContext = await this.resolveTenantContext(
      user,
      payload.tenantId,
    );

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

  async me(userId: string, tenantId?: string, tenantRole?: TenantRole) {
    return this.buildSessionUser(userId, tenantId, tenantRole);
  }

  async verifyEmail(token: string) {
    const normalizedToken = token.trim();
    if (!normalizedToken) {
      throw new BadRequestException('Verification token is required.');
    }

    const user = await this.usersService.verifyEmailByTokenHash(
      this.hashVerificationToken(normalizedToken),
    );

    if (!user) {
      throw new BadRequestException(
        'Verification token is invalid or has expired.',
      );
    }

    return {
      success: true,
      message: 'Email verified successfully.',
      email: user.email,
    };
  }

  async resendVerificationEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const genericResponse = {
      success: true,
      message:
        'If the account exists and is not verified, we have sent a new verification email.',
    };

    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user || user.emailVerified) {
      return genericResponse;
    }

    const verificationToken = await this.issueEmailVerificationToken(user.id);
    const verifyUrl = this.buildVerifyUrl(verificationToken);

    void this.notificationsService
      .enqueueVerifyEmail({
        to: user.email,
        fullName: user.fullName,
        verifyUrl,
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to resend verification email: ${message}`);
      });

    return genericResponse;
  }

  private async issueTokens(payload: JwtPayload) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const accessExpiresInRaw =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    const refreshExpiresInRaw =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    if (!accessSecret || !refreshSecret) {
      throw new InternalServerErrorException(
        'JWT configuration is missing required secrets.',
      );
    }

    let accessExpiresIn: number;
    let refreshExpiresIn: number;
    try {
      accessExpiresIn = this.parseExpiresInToSeconds(accessExpiresInRaw);
      refreshExpiresIn = this.parseExpiresInToSeconds(refreshExpiresInRaw);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Invalid JWT expiration config: ${message}`);
      throw new InternalServerErrorException(
        'JWT expiration config is invalid. Expected formats: 15m, 7d, 3600.',
      );
    }

    try {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to sign JWT tokens: ${message}`);
      throw new InternalServerErrorException(
        'JWT token generation failed. Check JWT_* environment variables.',
      );
    }
  }

  private async resolveTenantContext(
    user: { id: string; role: UserRole },
    tenantId?: string,
  ): Promise<{ tenantId: string; tenantRole: TenantRole }> {
    const normalizedTenantId = tenantId?.trim();
    const isSuperadmin = this.isSuperadmin(user.role);
    const isReseller = user.role === UserRole.RESELLER;

    if (!normalizedTenantId) {
      const memberships = await this.usersService.listTenantMemberships(
        user.id,
      );
      if (memberships.length > 0) {
        const defaultMembership = this.selectDefaultMembership(
          user.role,
          memberships,
        );
        return {
          tenantId: defaultMembership.tenant.id,
          tenantRole: defaultMembership.role,
        };
      }

      throw new ForbiddenException('No active tenant memberships found.');
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
      return {
        tenantId: normalizedTenantId,
        tenantRole: TenantRole.BUSINESS_ADMIN,
      };
    }

    if (isReseller && tenant.resellerId === user.id) {
      return {
        tenantId: normalizedTenantId,
        tenantRole: TenantRole.BUSINESS_ADMIN,
      };
    }

    throw new ForbiddenException('No access to tenant.');
  }

  private isSuperadmin(role: UserRole) {
    return role === UserRole.SUPERADMIN || role === UserRole.ADMIN;
  }

  private selectDefaultMembership(
    globalRole: UserRole,
    memberships: TenantMembershipContext[],
  ) {
    if (memberships.length === 1) {
      return memberships[0];
    }

    if (
      globalRole === UserRole.SUPERADMIN ||
      globalRole === UserRole.RESELLER
    ) {
      return memberships[0];
    }

    if (globalRole === UserRole.ADMIN) {
      return (
        memberships.find(
          (membership) => membership.role === TenantRole.BUSINESS_ADMIN,
        ) ?? memberships[0]
      );
    }

    if (globalRole === UserRole.STAFF) {
      return (
        memberships.find(
          (membership) => membership.role === TenantRole.STAFF,
        ) ??
        memberships.find(
          (membership) => membership.role === TenantRole.CLIENT,
        ) ??
        memberships[0]
      );
    }

    if (globalRole === UserRole.CLIENT) {
      return (
        memberships.find(
          (membership) => membership.role === TenantRole.CLIENT,
        ) ?? memberships[0]
      );
    }

    const tenantRolePriority: Record<TenantRole, number> = {
      BUSINESS_ADMIN: 0,
      STAFF: 1,
      CLIENT: 2,
    };

    return [...memberships].sort(
      (left, right) =>
        tenantRolePriority[left.role] - tenantRolePriority[right.role],
    )[0];
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
    const normalized = value
      .trim()
      .replace(/^['"]|['"]$/g, '')
      .toLowerCase();
    if (/^\d+$/.test(normalized)) {
      return Number(normalized);
    }

    const match = normalized.match(
      /^(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hour|hours|d|day|days|w|week|weeks)$/i,
    );
    if (!match) {
      throw new Error(`Invalid JWT expiration format: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers: Record<string, number> = {
      s: 1,
      sec: 1,
      secs: 1,
      second: 1,
      seconds: 1,
      m: 60,
      min: 60,
      mins: 60,
      minute: 60,
      minutes: 60,
      h: 60 * 60,
      hour: 60 * 60,
      hours: 60 * 60,
      d: 60 * 60 * 24,
      day: 60 * 60 * 24,
      days: 60 * 60 * 24,
      w: 60 * 60 * 24 * 7,
      week: 60 * 60 * 24 * 7,
      weeks: 60 * 60 * 24 * 7,
    };

    return amount * multipliers[unit];
  }

  private createVerificationToken() {
    return randomBytes(32).toString('hex');
  }

  private hashVerificationToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueEmailVerificationToken(userId: string) {
    const verificationToken = this.createVerificationToken();
    const verificationTokenHash = this.hashVerificationToken(verificationToken);
    const verificationExpiresAt = new Date(
      Date.now() + this.resolveVerificationTokenTtlMs(),
    );
    await this.usersService.setEmailVerificationToken(
      userId,
      verificationTokenHash,
      verificationExpiresAt,
    );
    return verificationToken;
  }

  private buildVerifyUrl(token: string) {
    const template = this.configService.get<string>(
      'VERIFY_EMAIL_URL_TEMPLATE',
    );
    if (template?.includes('{token}')) {
      return template.replace('{token}', token);
    }

    const frontendBase = this.configService.get<string>(
      'FRONTEND_PUBLIC_BASE_URL',
    );
    if (frontendBase) {
      const normalizedFrontendBase = frontendBase.replace(/\/$/, '');
      return `${normalizedFrontendBase}/verify-email?token=${encodeURIComponent(token)}`;
    }

    const apiBase =
      this.configService.get<string>('API_PUBLIC_BASE_URL') ??
      'http://localhost:3000';
    const normalizedApiBase = apiBase.replace(/\/$/, '');
    return `${normalizedApiBase}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  }

  private scheduleSignupEmails(params: {
    email: string;
    fullName: string;
    verifyUrl: string;
  }) {
    void Promise.allSettled([
      this.notificationsService.enqueueWelcomeEmail({
        to: params.email,
        fullName: params.fullName,
      }),
      this.notificationsService.enqueueVerifyEmail({
        to: params.email,
        fullName: params.fullName,
        verifyUrl: params.verifyUrl,
      }),
    ]).then((results) => {
      for (const result of results) {
        if (result.status === 'rejected') {
          const message =
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason);
          this.logger.error(`Failed to send signup email: ${message}`);
        }
      }
    });
  }

  private resolveVerificationTokenTtlMs() {
    const raw = this.configService
      .get<string>('VERIFY_EMAIL_TOKEN_TTL_MINUTES')
      ?.trim();

    if (!raw) {
      return 60 * 60 * 1000;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      this.logger.warn(
        'Invalid VERIFY_EMAIL_TOKEN_TTL_MINUTES value. Falling back to 60 minutes.',
      );
      return 60 * 60 * 1000;
    }

    return Math.floor(parsed * 60 * 1000);
  }

  private async buildSessionUser(
    userId: string,
    tenantId?: string,
    tenantRole?: TenantRole,
  ) {
    const [user, memberships] = await Promise.all([
      this.usersService.findOne(userId),
      this.usersService.listTenantMemberships(userId),
    ]);

    const activeMembership =
      memberships.find((membership) => membership.tenant.id === tenantId) ??
      memberships[0];

    return {
      ...user,
      tenantId: activeMembership?.tenant.id ?? tenantId,
      tenantRole: tenantRole ?? activeMembership?.role,
      activeTenant: activeMembership
        ? {
            id: activeMembership.tenant.id,
            name: activeMembership.tenant.name,
            slug: activeMembership.tenant.slug,
            status: activeMembership.tenant.status,
            resellerId: activeMembership.tenant.resellerId,
            role: activeMembership.role,
          }
        : null,
      memberships: memberships.map((membership) => ({
        role: membership.role,
        tenant: {
          id: membership.tenant.id,
          name: membership.tenant.name,
          slug: membership.tenant.slug,
          status: membership.tenant.status,
          resellerId: membership.tenant.resellerId,
        },
      })),
    };
  }
}
