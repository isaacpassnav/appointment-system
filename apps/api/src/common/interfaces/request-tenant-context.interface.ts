import { TenantRole, UserRole } from '@prisma/client';

export interface RequestTenantContext {
  tenantId: string | null;
  bypassTenancy: boolean;
  globalRole: UserRole;
  tenantRole: TenantRole | null;
  userId: string;
}
