'use client';

import Link from 'next/link';
import { DashboardStateGuard } from '@/components/dashboard/dashboard-state-guard';
import { ModuleHeader } from '@/components/dashboard/module-header';
import { ProfileEditForm } from '@/components/profile-edit-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';

function getInitials(value?: string) {
  if (!value) {
    return '?';
  }

  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function DashboardProfilePage() {
  const { user } = useAuth();

  return (
    <DashboardStateGuard>
      <ModuleHeader
        title="My Profile"
        description="Review your personal details and keep your account information up to date."
        actions={
          <Button
            asChild={true}
            size="sm"
            variant="outline"
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <Link href="/dashboard/settings">Account settings</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-slate-200 bg-white text-slate-950 shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-700">
                {getInitials(user?.fullName)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold text-slate-950">
                  {user?.fullName}
                </h2>
                <p className="truncate text-sm text-slate-500">{user?.email}</p>
                <Badge variant="secondary" className="mt-2 border-slate-200 bg-slate-100 text-slate-700">
                  {user?.role}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Timezone</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{user?.timezone || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Phone</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{user?.phone || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white text-slate-950 shadow-sm">
          <CardContent className="p-6">
            <ProfileEditForm />
          </CardContent>
        </Card>
      </div>
    </DashboardStateGuard>
  );
}
