'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  cancelAppointment,
  createAppointment,
  isApiError,
  listAppointments,
} from '@/lib/api';
import type { Appointment } from '@/lib/types';
import { useI18n } from '@/providers/locale-provider';
import { useAuth } from '@/providers/auth-provider';

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusClass(status: Appointment['status']) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-400/15 text-emerald-200 border-emerald-400/30';
    case 'CANCELLED':
      return 'bg-rose-500/15 text-rose-200 border-rose-500/30';
    default:
      return 'bg-primary/15 text-primary border-primary/30';
  }
}

export default function DashboardPage() {
  const { status, user, withAccessToken } = useAuth();
  const { t } = useI18n();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    startsAt: '',
    durationMinutes: 30,
    notes: '',
  });

  const upcomingCount = useMemo(
    () =>
      appointments.filter(
        (item) =>
          (item.status === 'SCHEDULED' || item.status === 'CONFIRMED') &&
          new Date(item.startsAt) >= new Date(),
      ).length,
    [appointments],
  );

  useEffect(() => {
    const load = async () => {
      if (status !== 'authenticated') {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await withAccessToken((accessToken) => listAppointments(accessToken));
        setAppointments(data);
      } catch (loadError) {
        if (isApiError(loadError)) {
          setError(loadError.message);
        } else {
          setError(t.dashboard.errorLoad);
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [status, withAccessToken, t.dashboard.errorLoad]);

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.startsAt) {
      setError(t.dashboard.errorMissingStart);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const created = await withAccessToken((accessToken) =>
        createAppointment(accessToken, {
          startsAt: new Date(form.startsAt).toISOString(),
          durationMinutes: Number(form.durationMinutes),
          notes: form.notes.trim() || undefined,
        }),
      );
      setAppointments((prev) => [created, ...prev]);
      setForm({ startsAt: '', durationMinutes: 30, notes: '' });
    } catch (submitError) {
      if (isApiError(submitError)) {
        setError(submitError.message);
      } else {
        setError(t.dashboard.errorCreate);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = async (appointmentId: string) => {
    setError(null);
    try {
      const updated = await withAccessToken((accessToken) =>
        cancelAppointment(accessToken, appointmentId),
      );
      setAppointments((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (cancelError) {
      if (isApiError(cancelError)) {
        setError(cancelError.message);
      } else {
        setError(t.dashboard.errorCancel);
      }
    }
  };

  if (status === 'loading') {
    return <p className="muted">{t.dashboard.loading}</p>;
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.unauthTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="muted">{t.dashboard.unauthBody}</p>
          <div className="hero-actions">
            <Button asChild>
              <Link href="/login">{t.dashboard.unauthPrimary}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">{t.dashboard.unauthSecondary}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="stack">
      <header className="dashboard-head reveal">
        <div>
          <p className="eyebrow">{t.dashboard.workspace}</p>
          <h1>{user.fullName}</h1>
          <p className="muted">
            {t.dashboard.roleTimezone
              .replace('{role}', user.role)
              .replace('{timezone}', user.timezone)}
          </p>
        </div>
        <div className="stat-pill">
          <strong>{upcomingCount}</strong>
          <span>{t.dashboard.upcoming}</span>
        </div>
      </header>

      <div className="dashboard-grid">
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.createTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="form-grid compact" onSubmit={onCreate}>
              <div className="grid gap-2">
                <Label htmlFor="appointment-start">{t.dashboard.dateTime}</Label>
                <Input
                  id="appointment-start"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appointment-duration">{t.dashboard.duration}</Label>
                <Input
                  id="appointment-duration"
                  type="number"
                  min={15}
                  max={720}
                  step={15}
                  value={form.durationMinutes}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      durationMinutes: Number(event.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appointment-notes">{t.dashboard.notes}</Label>
                <textarea
                  id="appointment-notes"
                  rows={3}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                  placeholder={t.dashboard.notesPlaceholder}
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? t.dashboard.creating : t.dashboard.createButton}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.tenantTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="muted">{t.dashboard.tenantBody}</p>
            <ul className="tenant-list">
              <li>
                <strong>{t.dashboard.tenantOwner}</strong>
                <span>{t.dashboard.tenantOwnerBody}</span>
              </li>
              <li>
                <strong>{t.dashboard.tenantReseller}</strong>
                <span>{t.dashboard.tenantResellerBody}</span>
              </li>
              <li>
                <strong>{t.dashboard.tenantClient}</strong>
                <span>{t.dashboard.tenantClientBody}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.appointmentsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? <p className="feedback error">{error}</p> : null}
          {loading ? <p className="muted">{t.dashboard.loadingAppointments}</p> : null}

          {!loading && appointments.length === 0 ? (
            <p className="muted">{t.dashboard.emptyAppointments}</p>
          ) : (
            <div className="appointments-grid">
              {appointments.map((item) => (
                <article key={item.id} className="appointment-item">
                  <div>
                    <p className="appointment-date">{formatDate(item.startsAt)}</p>
                    <p className="appointment-meta">
                      {t.dashboard.ends} {formatDate(item.endsAt)}{' '}
                      <Badge className={statusClass(item.status)}>{item.status}</Badge>
                    </p>
                    {item.notes ? <p className="appointment-notes">{item.notes}</p> : null}
                  </div>
                  {item.status !== 'CANCELLED' ? (
                    <Button variant="outline" size="sm" onClick={() => void onCancel(item.id)}>
                      {t.dashboard.cancel}
                    </Button>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
