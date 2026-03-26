'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardStateGuard } from '@/components/dashboard/dashboard-state-guard';
import { ModuleHeader } from '@/components/dashboard/module-header';
import { ProfileEditForm } from '@/components/profile-edit-form';
import { useAuth } from '@/providers/auth-provider';

function formatDate(value?: string) {
  if (!value) return '-';

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export default function DashboardSettingsPage() {
  const { user } = useAuth();

  return (
    <DashboardStateGuard>
      <ModuleHeader
        title="Settings"
        description="Manage your profile, security settings, and preferences."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 bg-white text-slate-950 shadow-sm lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="settings-avatar">
                {user?.fullName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">{user?.fullName}</h2>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <Badge
                  variant="secondary"
                  className="mt-1 border-slate-200 bg-slate-100 text-slate-700"
                >
                  {user?.role}
                </Badge>
              </div>
            </div>

            <ProfileEditForm />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white text-slate-950 shadow-sm">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-950">
              Account Information
            </h3>
            <div className="space-y-4">
              <div className="settings-field">
                <span className="settings-field-label">User ID</span>
                <span className="settings-field-mono">{user?.id}</span>
              </div>
              <div className="settings-field">
                <span className="settings-field-label">Member Since</span>
                <span className="settings-field-value">
                  {formatDate(user?.createdAt)}
                </span>
              </div>
              <div className="settings-field">
                <span className="settings-field-label">Email Verified</span>
                <span className="settings-field-value">
                  {user?.emailVerified ? (
                    <span className="font-semibold text-emerald-600">Verified</span>
                  ) : (
                    <span className="font-semibold text-amber-500">Pending</span>
                  )}
                </span>
              </div>
              <div className="settings-field">
                <span className="settings-field-label">Last Updated</span>
                <span className="settings-field-value">
                  {formatDate(user?.updatedAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardStateGuard>
  );
}
