'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CalendarDays,
  CreditCard,
  Users,
  WalletCards,
} from 'lucide-react';
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
import {
  getNotificationMetrics,
  listAppointments,
} from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardStateGuard } from '@/components/dashboard/dashboard-state-guard';
import { KpiCard } from '@/components/dashboard/kpi-card';
import {
  buildHybridOverviewData,
  buildMockOverviewData,
  type DashboardOverviewData,
} from '@/components/dashboard/overview-data';
import { TableSkeleton } from '@/components/dashboard/table-skeleton';
import { getPrimaryTenantForRole } from '@/components/dashboard/mock-data';
import { useAuth } from '@/providers/auth-provider';

const ROLE_LABELS = {
  SUPERADMIN: 'Superadmin',
  RESELLER: 'Reseller',
  ADMIN: 'Business Admin',
  STAFF: 'Staff',
  CLIENT: 'Client',
} as const;

const TENANT_ROLE_LABELS = {
  BUSINESS_ADMIN: 'Business Admin',
  STAFF: 'Staff',
  CLIENT: 'Client',
} as const;

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

function getPlanCopy(plan?: string, trialDaysLeft?: number) {
  if (plan === 'trial') {
    return `${trialDaysLeft ?? 7} days left`;
  }

  if (plan === 'enterprise') {
    return 'Enterprise plan';
  }

  if (plan === 'pro') {
    return 'Plan Pro';
  }

  return 'Starter plan';
}

export default function DashboardOverviewPage() {
  const { status, user, withAccessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const userRole = user?.role ?? 'CLIENT';
  const fallbackTenant = getPrimaryTenantForRole(userRole);
  const currentTenant = user?.activeTenant
    ? {
        id: user.activeTenant.id,
        name: user.activeTenant.name,
        role: userRole,
        plan: fallbackTenant?.plan ?? 'starter',
        logoSrc: fallbackTenant?.logoSrc ?? null,
        trialDaysLeft: fallbackTenant?.trialDaysLeft,
      }
    : fallbackTenant;
  const fallbackOverview = useMemo(
    () => buildMockOverviewData(user?.activeTenant?.id ?? currentTenant?.id),
    [currentTenant?.id, user?.activeTenant?.id],
  );
  const [overview, setOverview] = useState<DashboardOverviewData>(
    fallbackOverview,
  );

  useEffect(() => {
    setOverview(fallbackOverview);
  }, [fallbackOverview]);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (status !== 'authenticated' || !user) {
      setOverview(fallbackOverview);
      setIsLoading(false);
      return;
    }

    let active = true;

    const loadOverview = async () => {
      setIsLoading(true);

      try {
        const [appointments, metrics] = await withAccessToken((accessToken) =>
          Promise.all([
            listAppointments(accessToken),
            getNotificationMetrics(accessToken, 7),
          ]),
        );

        if (!active) {
          return;
        }

        setOverview(
          buildHybridOverviewData({
            fallback: fallbackOverview,
            appointments,
            metrics,
            user,
          }),
        );
      } catch {
        if (!active) {
          return;
        }

        setOverview(fallbackOverview);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      active = false;
    };
  }, [fallbackOverview, status, user, withAccessToken]);

  const greetingName =
    user?.fullName?.split(' ').slice(0, 2).join(' ') ?? 'there';
  const planCopy = getPlanCopy(
    currentTenant?.plan,
    currentTenant?.trialDaysLeft,
  );
  const roleLabel = user?.tenantRole
    ? TENANT_ROLE_LABELS[user.tenantRole]
    : ROLE_LABELS[userRole];

  return (
    <DashboardStateGuard>
      <div className="tenant-overview-shell">
        <header className="tenant-overview-header">
          <h1 className="tenant-overview-title">Welcome back, {greetingName}</h1>
          <p className="tenant-overview-meta">
            {currentTenant?.name ?? 'Active workspace'} - {roleLabel} - {planCopy}
          </p>
        </header>

        <div className="tenant-grid-4">
          <KpiCard
            label="Appointments Today"
            value={overview.kpis.appointmentsToday}
            trend={12}
            trendLabel="vs yesterday"
            icon={CalendarDays}
          />
          <KpiCard
            label="Active Customers"
            value={overview.kpis.activeCustomers}
            trend={18}
            trendLabel="this month"
            icon={Users}
          />
          <KpiCard
            label="Revenue This Month"
            value={overview.kpis.revenueToday}
            trend={12}
            trendLabel="collected"
            icon={WalletCards}
          />
          <KpiCard
            label="Attendance Rate"
            value={overview.kpis.conversionRate}
            suffix="%"
            trend={2}
            trendLabel="show-up trend"
            icon={Activity}
          />
        </div>

        {isLoading || status === 'loading' ? (
          <TableSkeleton rows={5} />
        ) : (
          <>
            <div className="tenant-overview-columns">
              <Card className="tenant-panel">
                <CardContent>
                  <h2 className="tenant-panel-title">Upcoming appointments</h2>
                  <div className="tenant-appointment-list">
                    {overview.upcomingAppointments.map((appointment) => (
                      <article key={appointment.id} className="tenant-appointment-item">
                        <span className="tenant-appointment-dot" aria-hidden={true} />
                        <div className="min-w-0">
                          <p className="tenant-appointment-name">
                            {appointment.customerName}
                          </p>
                          <p className="tenant-appointment-detail">
                            {appointment.serviceName}
                          </p>
                        </div>
                        <p className="tenant-appointment-time">
                          {appointment.timeLabel}
                        </p>
                      </article>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="tenant-stack">
                <Card className="tenant-panel">
                  <CardContent>
                    <h2 className="tenant-panel-title">Recent notifications</h2>
                    <div className="tenant-notification-list">
                      {overview.notifications.map((notification) => (
                        <article
                          key={notification.id}
                          className={`tenant-notification-item${notification.unread ? '' : ' is-read'}`}
                        >
                          <span className="tenant-notification-pulse" aria-hidden={true} />
                          <div className="min-w-0">
                            <p className="tenant-notification-title">
                              {notification.title}
                            </p>
                            <p className="tenant-notification-detail">
                              {notification.detail}
                            </p>
                          </div>
                          <p className="tenant-notification-time">
                            {notification.timeLabel}
                          </p>
                        </article>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="tenant-panel">
                  <CardContent>
                    <h2 className="tenant-panel-title">Payment overview</h2>
                    <div className="tenant-summary-grid">
                      <div className="tenant-summary-row">
                        <div>
                          <p className="tenant-summary-label">Collected revenue</p>
                          <p className="tenant-summary-value">
                            {formatCurrency(overview.kpis.revenueToday)}
                          </p>
                        </div>
                        <CreditCard className="h-5 w-5 text-violet-500" aria-hidden={true} />
                      </div>
                      <div className="tenant-summary-row">
                        <div>
                          <p className="tenant-summary-label">Pending invoices</p>
                          <p className="tenant-summary-value">
                            {formatCurrency(overview.kpis.pendingRevenue)}
                          </p>
                        </div>
                        <p className="tenant-summary-value">
                          {overview.pendingInvoicesCount}
                        </p>
                      </div>
                      <div className="tenant-summary-row">
                        <div>
                          <p className="tenant-summary-label">Latest activity</p>
                          <p className="tenant-summary-value">
                            {overview.activity[0]?.title ?? 'No activity yet'}
                          </p>
                        </div>
                        <p className="tenant-summary-label">
                          {overview.activity[0]
                            ? formatDateTime(overview.activity[0].timestampIso)
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="tenant-grid-2">
              <Card className="tenant-panel">
                <CardContent>
                  <h2 className="tenant-panel-title">Appointments this week</h2>
                  <div className="tenant-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={overview.trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,118,255,0.18)" />
                        <XAxis dataKey="label" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="bookings"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={false}
                          isAnimationActive={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="tenant-panel">
                <CardContent>
                  <h2 className="tenant-panel-title">Revenue trend</h2>
                  <div className="tenant-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={overview.trends}>
                        <defs>
                          <linearGradient id="dashboardRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.72} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.08} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,118,255,0.18)" />
                        <XAxis dataKey="label" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#7c3aed"
                          fill="url(#dashboardRevenueGradient)"
                          strokeWidth={3}
                          isAnimationActive={true}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="tenant-panel">
                <CardContent>
                  <h2 className="tenant-panel-title">Conversion trend</h2>
                  <div className="tenant-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={overview.trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,118,255,0.18)" />
                        <XAxis dataKey="label" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Line
                          type="monotone"
                          dataKey="conversionRate"
                          stroke="#22c55e"
                          strokeWidth={3}
                          dot={false}
                          isAnimationActive={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="tenant-panel">
                <CardContent>
                  <h2 className="tenant-panel-title">Recent activity</h2>
                  <div className="tenant-activity-list">
                    {overview.activity.map((event) => (
                      <motion.article
                        key={event.id}
                        className="tenant-activity-item"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.24 }}
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
          </>
        )}
      </div>
    </DashboardStateGuard>
  );
}
