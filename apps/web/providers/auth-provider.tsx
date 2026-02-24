'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ApiError,
  getCurrentUser,
  isApiError,
  logout as logoutRequest,
  refreshToken,
  signIn as signInRequest,
  signUp as signUpRequest,
} from '@/lib/api';
import type { AuthTokens, AuthUser, SignUpPayload } from '@/lib/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  logout: () => Promise<void>;
  withAccessToken: <T>(fn: (accessToken: string) => Promise<T>) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'appointment-system-auth';

function saveTokens(tokens: AuthTokens | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!tokens) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

function readTokens(): AuthTokens | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<AuthTokens>;
    if (
      typeof parsed.accessToken === 'string' &&
      typeof parsed.refreshToken === 'string'
    ) {
      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const tokensRef = useRef<AuthTokens | null>(null);

  const setSession = useCallback((nextUser: AuthUser | null, tokens: AuthTokens | null) => {
    setUser(nextUser);
    tokensRef.current = tokens;
    saveTokens(tokens);
    setStatus(nextUser && tokens ? 'authenticated' : 'unauthenticated');
  }, []);

  const renewSession = useCallback(async (): Promise<AuthTokens> => {
    const current = tokensRef.current;
    if (!current?.refreshToken) {
      throw new ApiError('Session expired.', 401);
    }

    const renewed = await refreshToken(current.refreshToken);
    tokensRef.current = renewed;
    saveTokens(renewed);
    return renewed;
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = readTokens();
      if (!stored) {
        setStatus('unauthenticated');
        return;
      }

      tokensRef.current = stored;

      try {
        const me = await getCurrentUser(stored.accessToken);
        setSession(me, stored);
      } catch (error) {
        if (!isApiError(error) || error.status !== 401) {
          setSession(null, null);
          return;
        }

        try {
          const renewed = await refreshToken(stored.refreshToken);
          const me = await getCurrentUser(renewed.accessToken);
          setSession(me, renewed);
        } catch {
          setSession(null, null);
        }
      }
    };

    void bootstrap();
  }, [setSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await signInRequest({ email, password });
      setSession(result.user, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    },
    [setSession],
  );

  const signUp = useCallback(
    async (payload: SignUpPayload) => {
      const result = await signUpRequest(payload);
      setSession(result.user, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    const current = tokensRef.current;
    if (current?.accessToken) {
      try {
        await logoutRequest(current.accessToken);
      } catch {
        // ignore remote logout failures and always clear local session
      }
    }
    setSession(null, null);
  }, [setSession]);

  const withAccessToken = useCallback(
    async <T,>(fn: (accessToken: string) => Promise<T>): Promise<T> => {
      const current = tokensRef.current;
      if (!current?.accessToken) {
        throw new ApiError('You need to sign in first.', 401);
      }

      try {
        return await fn(current.accessToken);
      } catch (error) {
        if (!isApiError(error) || error.status !== 401) {
          throw error;
        }

        const renewed = await renewSession();
        const me = await getCurrentUser(renewed.accessToken);
        setUser(me);
        setStatus('authenticated');
        return fn(renewed.accessToken);
      }
    },
    [renewSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signIn,
      signUp,
      logout,
      withAccessToken,
    }),
    [logout, signIn, signUp, status, user, withAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return context;
}
