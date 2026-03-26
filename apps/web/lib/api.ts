import type {
  Appointment,
  AuthTokens,
  AuthUser,
  SignUpPayload,
} from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

type ApiResponseError = {
  message?: string | string[];
  error?: { message?: string | string[] };
};

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

async function parseError(response: Response): Promise<never> {
  let payload: unknown;
  try {
    payload = (await response.json()) as ApiResponseError;
  } catch {
    payload = undefined;
  }

  const fromPayload =
    typeof payload === 'object' && payload !== null
      ? (payload as ApiResponseError)
      : undefined;

  const detail =
    fromPayload?.message ??
    fromPayload?.error?.message ??
    response.statusText ??
    'Request failed';
  const message = Array.isArray(detail) ? detail.join(', ') : detail;

  throw new ApiError(message || 'Request failed', response.status, payload);
}

async function jsonRequest<T>(
  path: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    await parseError(response);
  }

  return (await response.json()) as T;
}

export async function signIn(payload: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser } & AuthTokens> {
  return jsonRequest('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signUp(
  payload: SignUpPayload,
): Promise<{ user: AuthUser } & AuthTokens> {
  return jsonRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyEmailToken(token: string): Promise<{
  success: boolean;
  message: string;
  email: string;
}> {
  const query = new URLSearchParams({ token }).toString();
  return jsonRequest(`/auth/verify?${query}`, {
    method: 'GET',
  });
}

export async function resendVerificationEmail(
  email: string,
): Promise<{ success: boolean; message: string }> {
  return jsonRequest('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function refreshToken(refreshTokenValue: string): Promise<AuthTokens> {
  return jsonRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
}

export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  return jsonRequest('/auth/me', { method: 'GET' }, accessToken);
}

export async function logout(accessToken: string): Promise<void> {
  await jsonRequest('/auth/logout', { method: 'POST', body: '{}' }, accessToken);
}

export async function listAppointments(accessToken: string): Promise<Appointment[]> {
  return jsonRequest('/appointments', { method: 'GET' }, accessToken);
}

export async function createAppointment(
  accessToken: string,
  payload: { startsAt: string; durationMinutes: number; notes?: string },
): Promise<Appointment> {
  return jsonRequest(
    '/appointments',
    {
      method: 'POST',
      headers: {
        'x-idempotency-key':
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      },
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export async function cancelAppointment(
  accessToken: string,
  appointmentId: string,
): Promise<Appointment> {
  return jsonRequest(
    `/appointments/${appointmentId}/cancel`,
    { method: 'PATCH', body: '{}' },
    accessToken,
  );
}

export type ProfileUpdatePayload = {
  fullName?: string;
  phone?: string;
  timezone?: string;
};

export type PasswordUpdatePayload = {
  currentPassword: string;
  newPassword: string;
};

export type NotificationMetricsResponse = {
  window: {
    days: number;
    from: string;
    to: string;
  };
  totals: {
    queued: number;
    sent: number;
    failed: number;
    processed: number;
    sentRate: number;
  };
  byTemplate: Array<{
    template: string;
    queued: number;
    sent: number;
    failed: number;
  }>;
};

export async function getProfile(accessToken: string): Promise<AuthUser> {
  return jsonRequest('/users/me/profile', { method: 'GET' }, accessToken);
}

export async function updateProfile(
  accessToken: string,
  payload: ProfileUpdatePayload,
): Promise<AuthUser> {
  return jsonRequest('/users/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, accessToken);
}

export async function updatePassword(
  accessToken: string,
  payload: PasswordUpdatePayload,
): Promise<{ success: boolean; message: string }> {
  return jsonRequest('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, accessToken);
}

export async function getNotificationMetrics(
  accessToken: string,
  days = 7,
): Promise<NotificationMetricsResponse> {
  const query = new URLSearchParams({ days: String(days) }).toString();
  return jsonRequest(`/notifications/metrics?${query}`, { method: 'GET' }, accessToken);
}
