'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardStateGuard } from '@/components/dashboard/dashboard-state-guard';
import { ModuleHeader } from '@/components/dashboard/module-header';
import {
  DEFAULT_TENANT_ID,
  dashboardTrends,
  scopeByTenant,
} from '@/components/dashboard/mock-data';

export default function DashboardAnalyticsPage() {
  const tenantId = DEFAULT_TENANT_ID;
  const trends = scopeByTenant(dashboardTrends, tenantId);

  return (
    <DashboardStateGuard>
      <ModuleHeader
        title="Analytics"
        description="Revenue analytics, booking metrics, and customer growth trends."
      />

      <div className="tenant-grid-2">
        <article className="tenant-panel">
          <h2 className="tenant-panel-title">Revenue analytics</h2>
          <div className="tenant-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,118,255,0.18)" />
                <XAxis dataKey="label" stroke="#b8b4d4" />
                <YAxis stroke="#b8b4d4" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="tenant-panel">
          <h2 className="tenant-panel-title">Booking metrics</h2>
          <div className="tenant-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,118,255,0.18)" />
                <XAxis dataKey="label" stroke="#b8b4d4" />
                <YAxis stroke="#b8b4d4" />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#22d3ee" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="tenant-panel">
          <h2 className="tenant-panel-title">Customer growth</h2>
          <div className="tenant-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,118,255,0.18)" />
                <XAxis dataKey="label" stroke="#b8b4d4" />
                <YAxis stroke="#b8b4d4" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="customerGrowth"
                  stroke="#34d399"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="tenant-panel">
          <h2 className="tenant-panel-title">Conversion performance</h2>
          <div className="tenant-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,118,255,0.18)" />
                <XAxis dataKey="label" stroke="#b8b4d4" />
                <YAxis stroke="#b8b4d4" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line
                  type="monotone"
                  dataKey="conversionRate"
                  stroke="#f59e0b"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </DashboardStateGuard>
  );
}
