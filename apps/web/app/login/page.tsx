'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordVisibilityToggle } from '@/components/ui/password-visibility-toggle';
import { isApiError } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, status } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [router, status]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
      router.replace('/dashboard');
    } catch (submitError) {
      if (isApiError(submitError)) {
        setError(submitError.message);
      } else {
        setError(t('auth.loginError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrap reveal">
      <Card className="auth-card">
        <CardHeader>
          <p className="eyebrow">{t('auth.loginEyebrow')}</p>
          <CardTitle>{t('auth.loginTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="form-grid" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="login-email">{t('auth.loginEmail')}</Label>
              <Input
                id="login-email"
                type="email"
                placeholder={t('auth.loginPlaceholder')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-password">{t('auth.loginPassword')}</Label>
              <div className="password-field">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <PasswordVisibilityToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                  visibleLabel={t('auth.hidePassword')}
                  hiddenLabel={t('auth.showPassword')}
                />
              </div>
            </div>

            {error ? <p className="feedback error">{error}</p> : null}

            <Button type="submit" disabled={loading}>
              {loading ? t('auth.loginLoading') : t('auth.loginButton')}
            </Button>
          </form>
          <p className="muted mt-4">
            {t('auth.loginFooter')} <Link href="/signup">{t('auth.loginFooterLink')}</Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
