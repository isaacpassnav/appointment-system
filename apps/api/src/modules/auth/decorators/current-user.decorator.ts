import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestTenantContext } from '../../../common/interfaces/request-tenant-context.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{
      user: JwtPayload;
      tenantContext?: RequestTenantContext;
    }>();

    if (!request.tenantContext?.tenantId) {
      return request.user;
    }

    return {
      ...request.user,
      tenantId: request.tenantContext.tenantId,
      tenantRole: request.tenantContext.tenantRole ?? request.user.tenantRole,
    };
  },
);
