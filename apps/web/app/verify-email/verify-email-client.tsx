'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  isApiError,
  resendVerificationEmail,
  verifyEmailToken,
} from '@/lib/api';

type VerifyState = 'loading' | 'success' | 'error';

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const [state, setState] = useState<VerifyState>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verifiedAt, setVerifiedAt] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function runVerification() {
      if (!token) {
        if (cancelled) return;
        setState('error');
        setMessage('Verification token is missing or invalid.');
        return;
      }

      try {
        const result = await verifyEmailToken(token);
        if (cancelled) return;
        setState('success');
        setMessage(result.message || 'Email verified successfully.');
        setVerifiedEmail(result.email ?? '');
        setVerifiedAt(
          new Date().toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        );
        if (result.email) {
          setResendEmail(result.email);
        }
      } catch (error) {
        if (cancelled) return;
        setState('error');
        if (isApiError(error)) {
          setMessage(error.message);
        } else {
          setMessage('Verification failed. Request a new verification email.');
        }
      }
    }

    void runVerification();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const title = useMemo(() => {
    if (state === 'loading') return 'Verifying account';
    if (state === 'success') return 'Email verified';
    return 'Verification failed';
  }, [state]);

  const onResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = resendEmail.trim();
    if (!normalized) {
      setResendMessage('Type your email to resend the verification link.');
      return;
    }

    setResendLoading(true);
    setResendMessage('');

    try {
      const result = await resendVerificationEmail(normalized);
      setResendMessage(result.message);
    } catch (error) {
      setResendMessage(
        isApiError(error)
          ? error.message
          : 'We could not resend the verification email.',
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <section className="auth-wrap reveal">
      <Card className="auth-card">
        <CardHeader>
          <p className="eyebrow">Email verification</p>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="form-grid">
          <p className={state === 'success' ? 'feedback success' : 'feedback error'}>
            {message}
          </p>

          {verifiedEmail ? (
            <p className="muted">Verified account: {verifiedEmail}</p>
          ) : null}

          {state === 'success' ? (
            <div className="rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm">
              <p className="font-semibold">Verification details</p>
              <p className="mt-1 text-muted-foreground">
                Status: Verified successfully
              </p>
              {verifiedEmail ? (
                <p className="text-muted-foreground">Email: {verifiedEmail}</p>
              ) : null}
              {verifiedAt ? (
                <p className="text-muted-foreground">Verified at: {verifiedAt}</p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/login">Go to login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signup">Create new account</Link>
            </Button>
          </div>

          {state === 'error' ? (
            <form className="grid gap-3" onSubmit={onResend}>
              <Label htmlFor="resend-email">Resend verification email</Label>
              <Input
                id="resend-email"
                type="email"
                value={resendEmail}
                onChange={(event) => setResendEmail(event.target.value)}
                placeholder="owner@company.com"
                required
              />
              <Button type="submit" disabled={resendLoading}>
                {resendLoading ? 'Sending...' : 'Resend verification'}
              </Button>
              {resendMessage ? <p className="feedback info">{resendMessage}</p> : null}
            </form>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
