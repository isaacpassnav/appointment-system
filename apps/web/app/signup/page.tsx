'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { isApiError } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, status } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    timezone: 'UTC',
  });
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
        setError('Signup failed. Verify your data and retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrap reveal">
      <article className="card auth-card">
        <p className="eyebrow">Start now</p>
        <h1>Create your account</h1>
        <form className="form-grid" onSubmit={onSubmit}>
          <label className="field">
            <span>Full name</span>
            <input
              type="text"
              placeholder="Isaac Pasapera"
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="owner@company.com"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              minLength={8}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Timezone</span>
            <input
              type="text"
              placeholder="UTC"
              value={form.timezone}
              onChange={(event) => setForm((prev) => ({ ...prev, timezone: event.target.value }))}
            />
          </label>

          {error ? <p className="feedback error">{error}</p> : null}

          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="muted">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </article>
    </section>
  );
}
