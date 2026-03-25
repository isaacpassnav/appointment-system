export type UserRole = 'SUPERADMIN' | 'RESELLER' | 'ADMIN' | 'STAFF' | 'CLIENT';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  timezone: string;
  role: UserRole;
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
  userId: string;
  startsAt: string;
  endsAt: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  timezone?: string;
};
