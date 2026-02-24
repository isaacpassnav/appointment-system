'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  cancelAppointment,
  createAppointment,
  isApiError,
  listAppointments,
} from '@/lib/api';
import type { Appointment } from '@/lib/types';
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

export default function DashboardPage() {
  const { status, user, withAccessToken } = useAuth();
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
          setError('Could not load appointments.');
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [status, withAccessToken]);

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.startsAt) {
      setError('Pick a start date and time.');
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
        setError('Appointment could not be created.');
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
        setError('Could not cancel this appointment.');
      }
    }
  };

  if (status === 'loading') {
    return <p className="muted">Preparing your workspace...</p>;
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <section className="card reveal">
        <h1>You are not logged in</h1>
        <p className="muted">Sign in first to manage appointments and view your tenant workspace.</p>
        <div className="hero-actions">
          <Link href="/login" className="button button-primary">
            Log in
          </Link>
          <Link href="/signup" className="button button-ghost">
            Create account
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="dashboard-head reveal">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>{user.fullName}</h1>
          <p className="muted">
            Role: {user.role} · Timezone: {user.timezone}
          </p>
        </div>
        <div className="stat-pill">
          <strong>{upcomingCount}</strong>
          <span>Upcoming appointments</span>
        </div>
      </header>

      <div className="dashboard-grid">
        <article className="card reveal">
          <h2>Create appointment</h2>
          <form className="form-grid compact" onSubmit={onCreate}>
            <label className="field">
              <span>Date and time</span>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span>Duration (minutes)</span>
              <input
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
            </label>
            <label className="field">
              <span>Notes</span>
              <textarea
                rows={3}
                placeholder="Consultation topic, details, prep notes..."
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </label>
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create appointment'}
            </button>
          </form>
        </article>

        <article className="card reveal">
          <h2>Tenant strategy snapshot</h2>
          <p className="muted">
            Next phase for your reseller model. This UI is prepared to display tenant quotas and
            subaccounts.
          </p>
          <ul className="tenant-list">
            <li>
              <strong>Owner</strong>
              <span>Manages plans, reseller allocations and global limits.</span>
            </li>
            <li>
              <strong>Reseller</strong>
              <span>Creates child clients with monthly quota constraints.</span>
            </li>
            <li>
              <strong>Client</strong>
              <span>Operates appointments within assigned plan limits.</span>
            </li>
          </ul>
        </article>
      </div>

      <article className="card reveal">
        <h2>Appointments</h2>
        {error ? <p className="feedback error">{error}</p> : null}
        {loading ? <p className="muted">Loading appointments...</p> : null}

        {!loading && appointments.length === 0 ? (
          <p className="muted">No appointments yet. Create your first one above.</p>
        ) : (
          <div className="appointments-grid">
            {appointments.map((item) => (
              <article key={item.id} className="appointment-item">
                <div>
                  <p className="appointment-date">{formatDate(item.startsAt)}</p>
                  <p className="appointment-meta">
                    Ends {formatDate(item.endsAt)} · <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
                  </p>
                  {item.notes ? <p className="appointment-notes">{item.notes}</p> : null}
                </div>
                {item.status !== 'CANCELLED' ? (
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={() => void onCancel(item.id)}
                  >
                    Cancel
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
