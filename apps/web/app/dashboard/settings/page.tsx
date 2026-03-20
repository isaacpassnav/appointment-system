'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardStateGuard } from '@/components/dashboard/dashboard-state-guard';
import { ModuleHeader } from '@/components/dashboard/module-header';
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
        description="Tenant profile, account details, and operational preferences."
      />

      <div className="tenant-grid-2">
        <Card className="tenant-panel">
          <CardContent>
            <h2 className="tenant-panel-title">Profile</h2>
            <div className="tenant-table-shell">
              <div className="tenant-table-row">
                <p className="tenant-table-heading">Full name</p>
                <p className="tenant-table-cell">{user?.fullName ?? '-'}</p>
              </div>
              <div className="tenant-table-row">
                <p className="tenant-table-heading">Email</p>
                <p className="tenant-table-cell">{user?.email ?? '-'}</p>
              </div>
              <div className="tenant-table-row">
                <p className="tenant-table-heading">Timezone</p>
                <p className="tenant-table-cell">{user?.timezone ?? '-'}</p>
              </div>
              <div className="tenant-table-row">
                <p className="tenant-table-heading">Role</p>
                <p className="tenant-table-cell">{user?.role ?? '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="tenant-panel">
          <CardContent>
            <h2 className="tenant-panel-title">Account</h2>
            <div className="tenant-table-shell">
              <div className="tenant-table-row">
                <p className="tenant-table-heading">User ID</p>
                <p className="tenant-table-cell">{user?.id ?? '-'}</p>
              </div>
              <div className="tenant-table-row">
                <p className="tenant-table-heading">Member since</p>
                <p className="tenant-table-cell">{formatDate(user?.createdAt)}</p>
              </div>
              <div className="tenant-table-row">
                <p className="tenant-table-heading">Tenant mode</p>
                <p className="tenant-table-cell">Prepared for tenantId scoping</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardStateGuard>
  );
}
