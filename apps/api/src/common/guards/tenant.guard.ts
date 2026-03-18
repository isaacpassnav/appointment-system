import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import type { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';
import type { RequestTenantContext } from '../interfaces/request-tenant-context.interface';

type RequestWithTenantContext = Request & {
  tenantContext?: RequestTenantContext;
};

type AccessTokenPayload = JwtPayload & {
  iat?: number;
  exp?: number;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithTenantContext>();
    const token = this.extractBearerToken(request);
    if (!token) {
      return true;
    }

    let payload: AccessTokenPayload;
    try {
      payload = this.jwtService.verify<AccessTokenPayload>(token);
    } catch {
      // AccessTokenGuard will handle invalid token errors on protected routes.
      return true;
    }

    const isSuperadmin = this.isSuperadmin(payload.globalRole);
    const tenantOverride = this.extractTenantOverride(request);
    const resolvedTenantId = tenantOverride ?? payload.tenantId ?? null;

    if (!resolvedTenantId && !isSuperadmin) {
      throw new ForbiddenException('tenantId is required in JWT payload.');
    }

    request.tenantContext = {
      tenantId: resolvedTenantId,
      bypassTenancy: isSuperadmin,
      globalRole: payload.globalRole,
      tenantRole: payload.tenantRole ?? null,
      userId: payload.sub,
    };

    return true;
  }

  private extractBearerToken(request: Request): string | null {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return null;
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token.trim();
  }

  private extractTenantOverride(request: Request): string | null {
    const raw = request.headers['x-tenant-id'];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) {
      return null;
    }

    const normalized = value.trim();
    if (!normalized) {
      return null;
    }

    if (!UUID_PATTERN.test(normalized)) {
      throw new BadRequestException('x-tenant-id must be a valid UUID.');
    }

    return normalized;
  }

  private isSuperadmin(globalRole: UserRole): boolean {
    return globalRole === UserRole.SUPERADMIN || globalRole === UserRole.ADMIN;
  }
}
