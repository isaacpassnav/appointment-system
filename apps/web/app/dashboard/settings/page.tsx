'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { useTranslation } from 'react-i18next';

function formatDate(value: string | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function SettingsPage() {
  const { status, user } = useAuth();
  const { t } = useTranslation();

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
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="stack">
      <header className="dashboard-head reveal">
        <div>
          <p className="eyebrow">{t('dashNav.settings')}</p>
          <h1>{t('settings.title')}</h1>
        </div>
      </header>

      <div className="settings-grid">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.profileTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="settings-profile-head">
              <div className="settings-avatar">{getInitials(user.fullName)}</div>
              <div>
                <p className="settings-name">{user.fullName}</p>
                <p className="muted settings-email">{user.email}</p>
                <Badge
                  variant="secondary"
                  className="settings-role-badge"
                >
                  {user.role}
                </Badge>
              </div>
            </div>

            <div className="settings-divider" />

            <div className="settings-info-row">
              <div className="settings-field">
                <span className="settings-field-label">{t('settings.fullName')}</span>
                <span className="settings-field-value">{user.fullName}</span>
              </div>
              <div className="settings-field">
                <span className="settings-field-label">{t('settings.email')}</span>
                <span className="settings-field-value">{user.email}</span>
              </div>
              <div className="settings-field">
                <span className="settings-field-label">{t('settings.timezone')}</span>
                <span className="settings-field-value">{user.timezone}</span>
              </div>
              <div className="settings-field">
                <span className="settings-field-label">{t('settings.role')}</span>
                <span className="settings-field-value">{user.role}</span>
              </div>
            </div>

            <div className="settings-edit-row">
              <Button variant="outline" disabled>
                {t('settings.editButton')}
              </Button>
              <p className="muted settings-edit-note">{t('settings.editSoon')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.accountTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="settings-info-row">
              <div className="settings-field">
                <span className="settings-field-label">{t('settings.userId')}</span>
                <span className="settings-field-value settings-field-mono">{user.id}</span>
              </div>
              {user.createdAt && (
                <div className="settings-field">
                  <span className="settings-field-label">{t('settings.memberSince')}</span>
                  <span className="settings-field-value">{formatDate(user.createdAt)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
