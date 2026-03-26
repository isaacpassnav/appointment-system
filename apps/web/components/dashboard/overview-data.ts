import type { NotificationMetricsResponse } from '@/lib/api';
import type { Appointment, AuthUser } from '@/lib/types';
import {
  DEFAULT_TENANT_ID,
  appointmentsData,
  dashboardNotifications,
  dashboardTrends,
  recentActivityData,
  scopeByTenant,
} from '@/components/dashboard/mock-data';
import type {
  DashboardActivity,
  DashboardNotification,
  DashboardTrendPoint,
} from '@/components/dashboard/types';

export type DashboardOverviewCardMetrics = {
  appointmentsToday: number;
  activeCustomers: number;
  revenueToday: number;
  pendingRevenue: number;
  conversionRate: number;
};

export type DashboardOverviewAppointment = {
  id: string;
  customerName: string;
  serviceName: string;
  timeLabel: string;
};

export type DashboardOverviewData = {
  kpis: DashboardOverviewCardMetrics;
  pendingInvoicesCount: number;
  upcomingAppointments: DashboardOverviewAppointment[];
  notifications: DashboardNotification[];
  trends: DashboardTrendPoint[];
  activity: DashboardActivity[];
  source: 'mock' | 'hybrid';
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function resolveMockTenantId(preferredTenantId?: string) {
  if (
    preferredTenantId &&
    dashboardTrends.some((point) => point.tenantId === preferredTenantId)
  ) {
    return preferredTenantId;
  }

  return DEFAULT_TENANT_ID;
}

export function buildMockOverviewData(
  preferredTenantId?: string,
): DashboardOverviewData {
  const tenantId = resolveMockTenantId(preferredTenantId);
  const tenantAppointments = scopeByTenant(appointmentsData, tenantId);
  const confirmed = tenantAppointments.filter(
    (appointment) => appointment.status === 'confirmed',
  ).length;

  return {
    kpis: {
      appointmentsToday: tenantAppointments.length,
      activeCustomers: new Set(
        tenantAppointments.map((appointment) => appointment.customerName),
      ).size,
      revenueToday: tenantAppointments
        .filter((appointment) => appointment.paymentStatus === 'paid')
        .reduce((total, appointment) => total + appointment.amount, 0),
      pendingRevenue: tenantAppointments
        .filter((appointment) => appointment.paymentStatus === 'pending')
        .reduce((total, appointment) => total + appointment.amount, 0),
      conversionRate: tenantAppointments.length
        ? Math.round((confirmed / tenantAppointments.length) * 100)
        : 0,
    },
    pendingInvoicesCount: tenantAppointments.filter(
      (appointment) => appointment.paymentStatus === 'pending',
    ).length,
    upcomingAppointments: tenantAppointments
      .slice(0, 4)
      .map((appointment) => ({
        id: appointment.id,
        customerName: appointment.customerName,
        serviceName: appointment.serviceName,
        timeLabel: formatTime(appointment.dateIso),
      })),
    notifications: scopeByTenant(dashboardNotifications, tenantId).slice(0, 4),
    trends: scopeByTenant(dashboardTrends, tenantId),
    activity: scopeByTenant(recentActivityData, tenantId),
    source: 'mock',
  };
}

export function buildHybridOverviewData(params: {
  fallback: DashboardOverviewData;
  appointments?: Appointment[];
  metrics?: NotificationMetricsResponse;
  user?: AuthUser | null;
}): DashboardOverviewData {
  const { fallback, appointments = [], metrics, user } = params;
  const sortedAppointments = [...appointments].sort(
    (left, right) =>
      new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
  );

  if (sortedAppointments.length === 0 && !metrics) {
    return fallback;
  }

  const todayIso = new Date().toDateString();
  const todayAppointments = sortedAppointments.filter(
    (appointment) =>
      new Date(appointment.startsAt).toDateString() === todayIso,
  );
  const confirmedAppointments = sortedAppointments.filter(
    (appointment) => appointment.status === 'CONFIRMED',
  );
  const realCustomerCount = new Set(
    sortedAppointments.map(
      (appointment) => appointment.user?.id ?? appointment.userId,
    ),
  ).size;

  const metricNotifications = metrics
    ? [
        {
          tenantId:
            user?.activeTenant?.id ??
            fallback.notifications[0]?.tenantId ??
            DEFAULT_TENANT_ID,
          id: 'real-sent-rate',
          title: `Email sent rate ${metrics.totals.sentRate}%`,
          detail: `${metrics.totals.sent} sent / ${metrics.totals.processed} processed in the selected window.`,
          timeLabel: `${metrics.window.days} day window`,
          unread: metrics.totals.failed > 0,
        },
        {
          tenantId:
            user?.activeTenant?.id ??
            fallback.notifications[0]?.tenantId ??
            DEFAULT_TENANT_ID,
          id: 'real-queued',
          title: `${metrics.totals.queued} notifications queued`,
          detail: 'Pending reminder and confirmation jobs waiting to be delivered.',
          timeLabel: 'Live queue',
          unread: metrics.totals.queued > 0,
        },
        {
          tenantId:
            user?.activeTenant?.id ??
            fallback.notifications[0]?.tenantId ??
            DEFAULT_TENANT_ID,
          id: 'real-failed',
          title: `${metrics.totals.failed} failed deliveries`,
          detail: 'Review notification logs to inspect bounced or expired jobs.',
          timeLabel: 'Delivery health',
          unread: metrics.totals.failed > 0,
        },
      ].filter(
        (notification) =>
          notification.title !== '0 failed deliveries' ||
          notification.unread,
      )
    : fallback.notifications;

  const hybridAppointments =
    sortedAppointments.length > 0
      ? sortedAppointments.slice(0, 4).map((appointment) => ({
          id: appointment.id,
          customerName:
            appointment.user?.fullName ?? user?.fullName ?? 'Booked customer',
          serviceName:
            appointment.notes?.replace(/^\[seed\]\s*/i, '') ||
            'Scheduled appointment',
          timeLabel: formatTime(appointment.startsAt),
        }))
      : fallback.upcomingAppointments;

  const hybridActivity =
    sortedAppointments.length > 0
      ? sortedAppointments.slice(0, 4).map((appointment) => ({
          tenantId:
            user?.activeTenant?.id ??
            fallback.activity[0]?.tenantId ??
            DEFAULT_TENANT_ID,
          id: `appointment-${appointment.id}`,
          kind: 'appointment' as const,
          title: `Appointment ${appointment.status.toLowerCase()}`,
          detail:
            appointment.notes?.replace(/^\[seed\]\s*/i, '') ||
            'Scheduled appointment',
          timestampIso: appointment.startsAt,
        }))
      : fallback.activity;

  return {
    ...fallback,
    kpis: {
      appointmentsToday:
        todayAppointments.length > 0
          ? todayAppointments.length
          : fallback.kpis.appointmentsToday,
      activeCustomers:
        realCustomerCount > 1 ? realCustomerCount : fallback.kpis.activeCustomers,
      revenueToday: fallback.kpis.revenueToday,
      pendingRevenue: fallback.kpis.pendingRevenue,
      conversionRate:
        sortedAppointments.length > 0
          ? Math.round(
              (confirmedAppointments.length / sortedAppointments.length) * 100,
            )
          : fallback.kpis.conversionRate,
    },
    pendingInvoicesCount: fallback.pendingInvoicesCount,
    upcomingAppointments: hybridAppointments,
    notifications:
      metricNotifications.length > 0
        ? metricNotifications.slice(0, 4)
        : fallback.notifications,
    activity: hybridActivity,
    source: 'hybrid',
  };
}
