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
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';
import {
  FaCalendarCheck,
  FaCalendar,
  FaClipboardList,
  FaBan,
} from 'react-icons/fa6';

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(startsAt: string, endsAt: string) {
  const diff = new Date(endsAt).getTime() - new Date(startsAt).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

function statusClass(status: Appointment['status']) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-400/15 text-emerald-200 border-emerald-400/30';
    case 'CANCELLED':
      return 'bg-rose-500/15 text-rose-200 border-rose-500/30';
    case 'COMPLETED':
      return 'bg-blue-400/15 text-blue-200 border-blue-400/30';
    case 'NO_SHOW':
      return 'bg-amber-400/15 text-amber-200 border-amber-400/30';
    default:
      return 'bg-primary/15 text-primary border-primary/30';
  }
}

type TabKey = 'upcoming' | 'past' | 'all';

export default function DashboardPage() {
  const { status, user, withAccessToken } = useAuth();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [form, setForm] = useState({
    startsAt: '',
    durationMinutes: 30,
    notes: '',
  });

  const kpis = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      upcoming: appointments.filter(
        (a) =>
          (a.status === 'SCHEDULED' || a.status === 'CONFIRMED') &&
          new Date(a.startsAt) >= now,
      ).length,
      thisWeek: appointments.filter(
        (a) =>
          new Date(a.startsAt) >= now &&
          new Date(a.startsAt) <= nextWeek &&
          a.status !== 'CANCELLED',
      ).length,
      total: appointments.length,
      cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    if (activeTab === 'upcoming') {
      return appointments.filter(
        (a) =>
          (a.status === 'SCHEDULED' || a.status === 'CONFIRMED') &&
          new Date(a.startsAt) >= now,
      );
    }
    if (activeTab === 'past') {
      return appointments.filter(
        (a) =>
          new Date(a.endsAt) < now ||
          a.status === 'COMPLETED' ||
          a.status === 'NO_SHOW' ||
          a.status === 'CANCELLED',
      );
    }
    return appointments;
  }, [appointments, activeTab]);

  const tabCounts = useMemo(() => {
    const now = new Date();
    return {
      upcoming: appointments.filter(
        (a) =>
          (a.status === 'SCHEDULED' || a.status === 'CONFIRMED') &&
          new Date(a.startsAt) >= now,
      ).length,
      past: appointments.filter(
        (a) =>
          new Date(a.endsAt) < now ||
          a.status === 'COMPLETED' ||
          a.status === 'NO_SHOW' ||
          a.status === 'CANCELLED',
      ).length,
      all: appointments.length,
    };
  }, [appointments]);

  useEffect(() => {
    const load = async () => {
      if (status !== 'authenticated') {
        setLoading(false);
        return;
      }
      setLoading(true);
      setListError(null);
      try {
        const data = await withAccessToken((token) => listAppointments(token));
        setAppointments(data);
      } catch (err) {
        setListError(isApiError(err) ? err.message : t('dashboard.errorLoad'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [status, withAccessToken, t]);

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.startsAt) {
      setFormError(t('dashboard.errorMissingStart'));
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await withAccessToken((token) =>
        createAppointment(token, {
          startsAt: new Date(form.startsAt).toISOString(),
          durationMinutes: Number(form.durationMinutes),
          notes: form.notes.trim() || undefined,
        }),
      );
      setAppointments((prev) => [created, ...prev]);
      setForm({ startsAt: '', durationMinutes: 30, notes: '' });
      setActiveTab('upcoming');
    } catch (err) {
      setFormError(isApiError(err) ? err.message : t('dashboard.errorCreate'));
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = async (id: string) => {
    setListError(null);
    try {
      const updated = await withAccessToken((token) => cancelAppointment(token, id));
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      setListError(isApiError(err) ? err.message : t('dashboard.errorCancel'));
    }
  };

  if (status === 'loading') {
    return (
      <div className="dash-loading">
        <p className="muted">{t('dashboard.loading')}</p>
      </div>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.unauthTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="muted">{t('dashboard.unauthBody')}</p>
          <div className="hero-actions">
            <Button asChild>
              <Link href="/login">{t('dashboard.unauthPrimary')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">{t('dashboard.unauthSecondary')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'upcoming', label: t('dashboard.tabUpcoming'), count: tabCounts.upcoming },
    { key: 'past', label: t('dashboard.tabPast'), count: tabCounts.past },
    { key: 'all', label: t('dashboard.tabAll'), count: tabCounts.all },
  ];

  return (
    <section className="stack">
      {/* Header */}
      <header className="dashboard-head reveal">
        <div>
          <p className="eyebrow">{t('dashboard.workspace')}</p>
          <h1>{user.fullName}</h1>
          <p className="muted">
            {t('dashboard.roleTimezone', {
              role: user.role,
              timezone: user.timezone,
            })}
          </p>
        </div>
      </header>

      {/* KPI row */}
      <div className="kpi-row">
        <div className="kpi-card kpi-accent">
          <div className="kpi-card-header">
            <span className="kpi-card-label">{t('dashboard.kpiUpcoming')}</span>
            <FaCalendarCheck className="kpi-card-icon" aria-hidden />
          </div>
          <span className="kpi-card-value">{loading ? '—' : kpis.upcoming}</span>
        </div>
        <div className="kpi-card kpi-warning">
          <div className="kpi-card-header">
            <span className="kpi-card-label">{t('dashboard.kpiThisWeek')}</span>
            <FaCalendar className="kpi-card-icon" aria-hidden />
          </div>
          <span className="kpi-card-value">{loading ? '—' : kpis.thisWeek}</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">{t('dashboard.kpiTotal')}</span>
            <FaClipboardList className="kpi-card-icon" aria-hidden />
          </div>
          <span className="kpi-card-value">{loading ? '—' : kpis.total}</span>
        </div>
        <div className="kpi-card kpi-danger">
          <div className="kpi-card-header">
            <span className="kpi-card-label">{t('dashboard.kpiCancelled')}</span>
            <FaBan className="kpi-card-icon" aria-hidden />
          </div>
          <span className="kpi-card-value">{loading ? '—' : kpis.cancelled}</span>
        </div>
      </div>

      {/* Create appointment */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.createTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {formError && (
            <p className="feedback error" style={{ marginBottom: '12px' }}>
              {formError}
            </p>
          )}
          <form className="form-grid compact" onSubmit={onCreate}>
            <div className="create-form-row">
              <div className="grid gap-2">
                <Label htmlFor="appointment-start">{t('dashboard.dateTime')}</Label>
                <Input
                  id="appointment-start"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startsAt: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appointment-duration">{t('dashboard.duration')}</Label>
                <Input
                  id="appointment-duration"
                  type="number"
                  min={15}
                  max={720}
                  step={15}
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      durationMinutes: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="appointment-notes">{t('dashboard.notes')}</Label>
              <textarea
                id="appointment-notes"
                rows={2}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                placeholder={t('dashboard.notesPlaceholder')}
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
            <div>
              <Button type="submit" disabled={submitting}>
                {submitting ? t('dashboard.creating') : t('dashboard.createButton')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Appointments list */}
      <Card>
        <CardHeader>
          <div className="appointments-head">
            <CardTitle>{t('dashboard.appointmentsTitle')}</CardTitle>
            <div className="filter-tabs">
              {tabs.map(({ key, label, count }) => (
                <button
                  key={key}
                  type="button"
                  className={`filter-tab-btn${activeTab === key ? ' active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {label}
                  {count > 0 && <span className="tab-count"> {count}</span>}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {listError && <p className="feedback error">{listError}</p>}
          {loading ? (
            <p className="muted">{t('dashboard.loadingAppointments')}</p>
          ) : filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <p className="muted">
                {activeTab === 'upcoming'
                  ? t('dashboard.emptyUpcoming')
                  : activeTab === 'past'
                    ? t('dashboard.emptyPast')
                    : t('dashboard.emptyAppointments')}
              </p>
            </div>
          ) : (
            <div className="appointments-grid">
              {filteredAppointments.map((item) => (
                <article key={item.id} className="appointment-item">
                  <div className="appointment-left">
                    <p className="appointment-date">{formatDate(item.startsAt)}</p>
                    <div className="appointment-meta">
                      <span className="appointment-duration">
                        {formatDuration(item.startsAt, item.endsAt)}
                      </span>
                      <Badge className={statusClass(item.status)}>{item.status}</Badge>
                    </div>
                    {item.notes ? (
                      <p className="appointment-notes">{item.notes}</p>
                    ) : null}
                  </div>
                  {item.status !== 'CANCELLED' &&
                  item.status !== 'COMPLETED' &&
                  item.status !== 'NO_SHOW' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="appointment-cancel-btn"
                      onClick={() => void onCancel(item.id)}
                    >
                      {t('dashboard.cancel')}
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
