'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isApiError } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, status } = useAuth();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    timezone: 'UTC',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

    if (form.password !== confirmPassword) {
      setError(t('auth.signupMismatch'));
      setLoading(false);
      return;
    }

    try {
      await signUp({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        timezone: form.timezone.trim() || 'UTC',
      });
      router.replace('/dashboard');
    } catch (submitError) {
      if (isApiError(submitError)) {
        setError(submitError.message);
      } else {
        setError(t('auth.signupError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrap reveal">
      <Card className="auth-card">
        <CardHeader>
          <p className="eyebrow">{t('auth.signupEyebrow')}</p>
          <CardTitle>{t('auth.signupTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="form-grid" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="signup-name">{t('auth.signupName')}</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder={t('auth.signupNamePlaceholder')}
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signup-email">{t('auth.signupEmail')}</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder={t('auth.signupEmailPlaceholder')}
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signup-password">{t('auth.signupPassword')}</Label>
              <div className="password-field">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  minLength={8}
                  placeholder={t('auth.signupPasswordPlaceholder')}
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signup-confirm">{t('auth.signupConfirm')}</Label>
              <div className="password-field">
                <Input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  minLength={8}
                  placeholder={t('auth.signupConfirmPlaceholder')}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="password-toggle"
                  onClick={() => setShowConfirm((value) => !value)}
                >
                  {showConfirm ? t('auth.hidePassword') : t('auth.showPassword')}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signup-timezone">{t('auth.signupTimezone')}</Label>
              <Input
                id="signup-timezone"
                type="text"
                placeholder={t('auth.signupTimezonePlaceholder')}
                value={form.timezone}
                onChange={(event) => setForm((prev) => ({ ...prev, timezone: event.target.value }))}
              />
            </div>

            {error ? <p className="feedback error">{error}</p> : null}

            <Button type="submit" disabled={loading}>
              {loading ? t('auth.signupLoading') : t('auth.signupButton')}
            </Button>
          </form>
          <p className="muted mt-4">
            {t('auth.signupFooter')} <Link href="/login">{t('auth.signupFooterLink')}</Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
