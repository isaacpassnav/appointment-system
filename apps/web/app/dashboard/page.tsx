'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardStateGuard } from '@/components/dashboard/dashboard-state-guard';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { ModuleHeader } from '@/components/dashboard/module-header';
import { TableSkeleton } from '@/components/dashboard/table-skeleton';
import {
  DEFAULT_TENANT_ID,
  appointmentsData,
  dashboardTrends,
  recentActivityData,
  scopeByTenant,
} from '@/components/dashboard/mock-data';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: '2-digit',
  });
}

export default function DashboardOverviewPage() {
  const tenantId = DEFAULT_TENANT_ID;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 550);
    return () => window.clearTimeout(timer);
  }, []);

  const tenantAppointments = useMemo(
    () => scopeByTenant(appointmentsData, tenantId),
    [tenantId],
  );
  const tenantTrends = useMemo(
    () => scopeByTenant(dashboardTrends, tenantId),
    [tenantId],
  );
  const tenantActivity = useMemo(
    () => scopeByTenant(recentActivityData, tenantId),
    [tenantId],
  );

  const kpis = useMemo(() => {
    const todayAppointments = tenantAppointments.length;
    const revenueToday = tenantAppointments
      .filter((item) => item.paymentStatus === 'paid')
      .reduce((acc, item) => acc + item.amount, 0);
    const confirmed = tenantAppointments.filter(
      (item) => item.status === 'confirmed',
    ).length;
    const conversionRate = todayAppointments
      ? Math.round((confirmed / todayAppointments) * 100)
      : 0;
    const activeCustomers = new Set(
      tenantAppointments.map((item) => item.customerName),
    ).size;

    return {
      appointmentsToday: todayAppointments,
      revenueToday,
      conversionRate,
      activeCustomers,
    };
  }, [tenantAppointments]);

  return (
    <DashboardStateGuard>
      <ModuleHeader
        title="Tenant Overview"
        description="Real-time snapshot of appointments, revenue, conversion, and customer activity."
      />

      <div className="tenant-grid-4">
        <KpiCard
          label="Appointments Today"
          value={kpis.appointmentsToday}
          trend={12}
          trendLabel="vs yesterday"
        />
        <KpiCard
          label="Revenue Today"
          value={kpis.revenueToday}
          trend={9}
          trendLabel="daily growth"
        />
        <KpiCard
          label="Conversion Rate"
          value={kpis.conversionRate}
          suffix="%"
          trend={4}
          trendLabel="lead to booking"
        />
        <KpiCard
          label="Active Customers"
          value={kpis.activeCustomers}
          trend={7}
          trendLabel="weekly trend"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="tenant-grid-2">
          <Card className="tenant-panel">
            <CardContent>
              <h2 className="tenant-panel-title">Bookings Over Time</h2>
              <div className="tenant-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tenantTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,118,255,0.18)" />
                    <XAxis dataKey="label" stroke="#b8b4d4" />
                    <YAxis stroke="#b8b4d4" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="#a855f7"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="tenant-panel">
            <CardContent>
              <h2 className="tenant-panel-title">Revenue Trend (Wave)</h2>
              <div className="tenant-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tenantTrends}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,118,255,0.18)" />
                    <XAxis dataKey="label" stroke="#b8b4d4" />
                    <YAxis stroke="#b8b4d4" />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#7c3aed"
                      fill="url(#revenueGradient)"
                      strokeWidth={3}
                      isAnimationActive
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="tenant-panel">
            <CardContent>
              <h2 className="tenant-panel-title">Conversion Rate</h2>
              <div className="tenant-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tenantTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,118,255,0.18)" />
                    <XAxis dataKey="label" stroke="#b8b4d4" />
                    <YAxis stroke="#b8b4d4" />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Line
                      type="monotone"
                      dataKey="conversionRate"
                      stroke="#22d3ee"
                      strokeWidth={3}
                      isAnimationActive
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="tenant-panel">
            <CardContent>
              <h2 className="tenant-panel-title">Recent Activity</h2>
              <div className="tenant-activity-list">
                {tenantActivity.map((event) => (
                  <motion.article
                    key={event.id}
                    className="tenant-activity-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="tenant-activity-title">{event.title}</p>
                    <p className="tenant-activity-detail">{event.detail}</p>
                    <p className="tenant-activity-time">
                      {formatDateTime(event.timestampIso)}
                    </p>
                  </motion.article>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardStateGuard>
  );
}
