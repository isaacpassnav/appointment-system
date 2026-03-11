import { TenantRole, UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  globalRole: UserRole;
  tenantId: string;
  tenantRole: TenantRole;
}
