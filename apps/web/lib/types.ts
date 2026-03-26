export type UserRole = 'SUPERADMIN' | 'RESELLER' | 'ADMIN' | 'STAFF' | 'CLIENT';
export type TenantRole = 'BUSINESS_ADMIN' | 'STAFF' | 'CLIENT';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED';

export type AuthTenant = {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  resellerId?: string | null;
};

export type AuthTenantMembership = {
  role: TenantRole;
  tenant: AuthTenant;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  timezone: string;
  role: UserRole;
  tenantId?: string;
  tenantRole?: TenantRole;
  activeTenant?: (AuthTenant & { role: TenantRole }) | null;
  memberships?: AuthTenantMembership[];
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type Appointment = {
  id: string;
  tenantId: string;
  userId: string;
  startsAt: string;
  endsAt: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
};

export type SignUpPayload = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  timezone?: string;
};
