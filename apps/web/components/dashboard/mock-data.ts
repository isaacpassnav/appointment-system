import type {
  DashboardActivity,
  DashboardAppointment,
  DashboardNotification,
  DashboardAutomation,
  DashboardCustomer,
  DashboardMessageLog,
  DashboardService,
  DashboardTenantSummary,
  DashboardTrendPoint,
  TenantScoped,
} from './types';
import type { UserRole } from '@/lib/types';

export const DEFAULT_TENANT_ID = 'tenant-default';
export const SECONDARY_TENANT_ID = 'tenant-secondary';

export function scopeByTenant<T extends TenantScoped>(
  items: T[],
  tenantId: string,
) {
  return items.filter((item) => item.tenantId === tenantId);
}

export function getPrimaryTenantForRole(role: UserRole) {
  return dashboardTenantsByRole[role][0];
}

export const dashboardTrends: DashboardTrendPoint[] = [
  { tenantId: DEFAULT_TENANT_ID, label: 'Mon', bookings: 28, revenue: 620, conversionRate: 34, customerGrowth: 4 },
  { tenantId: DEFAULT_TENANT_ID, label: 'Tue', bookings: 31, revenue: 710, conversionRate: 38, customerGrowth: 6 },
  { tenantId: DEFAULT_TENANT_ID, label: 'Wed', bookings: 36, revenue: 840, conversionRate: 41, customerGrowth: 8 },
  { tenantId: DEFAULT_TENANT_ID, label: 'Thu', bookings: 33, revenue: 780, conversionRate: 39, customerGrowth: 7 },
  { tenantId: DEFAULT_TENANT_ID, label: 'Fri', bookings: 42, revenue: 980, conversionRate: 44, customerGrowth: 11 },
  { tenantId: DEFAULT_TENANT_ID, label: 'Sat', bookings: 45, revenue: 1060, conversionRate: 47, customerGrowth: 13 },
  { tenantId: DEFAULT_TENANT_ID, label: 'Sun', bookings: 38, revenue: 890, conversionRate: 42, customerGrowth: 9 },
];

export const appointmentsData: DashboardAppointment[] = [
  { tenantId: DEFAULT_TENANT_ID, id: 'a-001', customerName: 'Olivia Patel', serviceName: 'Haircut + Styling', dateIso: '2026-03-20T10:00:00.000Z', status: 'confirmed', paymentStatus: 'paid', amount: 45 },
  { tenantId: DEFAULT_TENANT_ID, id: 'a-002', customerName: 'Noah Smith', serviceName: 'Dental Cleaning', dateIso: '2026-03-20T11:30:00.000Z', status: 'pending', paymentStatus: 'pending', amount: 90 },
  { tenantId: DEFAULT_TENANT_ID, id: 'a-003', customerName: 'Emma Rodriguez', serviceName: 'Skin Consultation', dateIso: '2026-03-20T13:00:00.000Z', status: 'confirmed', paymentStatus: 'paid', amount: 120 },
  { tenantId: DEFAULT_TENANT_ID, id: 'a-004', customerName: 'Liam Chen', serviceName: 'Therapy Session', dateIso: '2026-03-20T14:30:00.000Z', status: 'canceled', paymentStatus: 'failed', amount: 75 },
  { tenantId: DEFAULT_TENANT_ID, id: 'a-005', customerName: 'Sophia Gomez', serviceName: 'Nail Package', dateIso: '2026-03-20T16:00:00.000Z', status: 'pending', paymentStatus: 'pending', amount: 55 },
];

export const customersData: DashboardCustomer[] = [
  { tenantId: DEFAULT_TENANT_ID, id: 'c-001', name: 'Olivia Patel', email: 'olivia@example.com', phone: '+1 202 555 0101', lastVisitIso: '2026-03-18T10:00:00.000Z', totalSpent: 640 },
  { tenantId: DEFAULT_TENANT_ID, id: 'c-002', name: 'Noah Smith', email: 'noah@example.com', phone: '+1 202 555 0102', lastVisitIso: '2026-03-16T11:30:00.000Z', totalSpent: 320 },
  { tenantId: DEFAULT_TENANT_ID, id: 'c-003', name: 'Emma Rodriguez', email: 'emma@example.com', phone: '+1 202 555 0103', lastVisitIso: '2026-03-17T13:00:00.000Z', totalSpent: 980 },
  { tenantId: DEFAULT_TENANT_ID, id: 'c-004', name: 'Liam Chen', email: 'liam@example.com', phone: '+1 202 555 0104', lastVisitIso: '2026-03-14T14:30:00.000Z', totalSpent: 270 },
  { tenantId: DEFAULT_TENANT_ID, id: 'c-005', name: 'Sophia Gomez', email: 'sophia@example.com', phone: '+1 202 555 0105', lastVisitIso: '2026-03-15T16:00:00.000Z', totalSpent: 510 },
];

export const servicesData: DashboardService[] = [
  { tenantId: DEFAULT_TENANT_ID, id: 's-001', name: 'Haircut + Styling', price: 45, durationMinutes: 45, availability: 'Mon-Sat, 9:00-18:00', isActive: true },
  { tenantId: DEFAULT_TENANT_ID, id: 's-002', name: 'Dental Cleaning', price: 90, durationMinutes: 60, availability: 'Mon-Fri, 8:00-16:00', isActive: true },
  { tenantId: DEFAULT_TENANT_ID, id: 's-003', name: 'Skin Consultation', price: 120, durationMinutes: 50, availability: 'Tue-Sat, 10:00-19:00', isActive: true },
];

export const automationsData: DashboardAutomation[] = [
  { tenantId: DEFAULT_TENANT_ID, id: 'auto-001', name: 'Appointment Reminder 24h', channel: 'Email', trigger: '24h before appointment', enabled: true },
  { tenantId: DEFAULT_TENANT_ID, id: 'auto-002', name: 'Appointment Reminder 1h', channel: 'WhatsApp', trigger: '1h before appointment', enabled: true },
  { tenantId: DEFAULT_TENANT_ID, id: 'auto-003', name: 'Post-visit Follow-up', channel: 'SMS', trigger: '2h after appointment', enabled: false },
];

export const messageLogsData: DashboardMessageLog[] = [
  { tenantId: DEFAULT_TENANT_ID, id: 'm-001', channel: 'Email', templateName: 'Verification Email', recipient: 'olivia@example.com', sentAtIso: '2026-03-20T07:10:00.000Z', status: 'sent' },
  { tenantId: DEFAULT_TENANT_ID, id: 'm-002', channel: 'WhatsApp', templateName: 'Reminder 24h', recipient: '+12025550102', sentAtIso: '2026-03-20T08:00:00.000Z', status: 'queued' },
  { tenantId: DEFAULT_TENANT_ID, id: 'm-003', channel: 'Telegram', templateName: 'Promo Follow-up', recipient: '@emma_client', sentAtIso: '2026-03-20T08:20:00.000Z', status: 'failed' },
];

export const recentActivityData: DashboardActivity[] = [
  { tenantId: DEFAULT_TENANT_ID, id: 'ra-001', kind: 'appointment', title: 'Appointment confirmed', detail: 'Olivia Patel - Haircut + Styling', timestampIso: '2026-03-20T09:10:00.000Z' },
  { tenantId: DEFAULT_TENANT_ID, id: 'ra-002', kind: 'customer', title: 'New customer created', detail: 'Noah Smith joined from landing campaign', timestampIso: '2026-03-20T08:40:00.000Z' },
  { tenantId: DEFAULT_TENANT_ID, id: 'ra-003', kind: 'cancellation', title: 'Appointment canceled', detail: 'Liam Chen - Therapy Session', timestampIso: '2026-03-20T08:15:00.000Z' },
];

export const dashboardNotifications: DashboardNotification[] = [
  {
    tenantId: DEFAULT_TENANT_ID,
    id: 'dn-001',
    title: 'New arrival: Lisa Wilson',
    detail: 'Front desk confirmed a same-day booking.',
    timeLabel: '10 min ago',
    unread: true,
  },
  {
    tenantId: DEFAULT_TENANT_ID,
    id: 'dn-002',
    title: 'Payment overdue: Mark Johnson',
    detail: 'Invoice INV-1092 needs follow-up.',
    timeLabel: '30 min ago',
    unread: true,
  },
  {
    tenantId: DEFAULT_TENANT_ID,
    id: 'dn-003',
    title: 'New client: Sarah Peterson',
    detail: 'Profile created from booking form.',
    timeLabel: '1 hour ago',
    unread: true,
  },
  {
    tenantId: DEFAULT_TENANT_ID,
    id: 'dn-004',
    title: 'Reminder sent',
    detail: 'Staff meeting reminder delivered to 12 recipients.',
    timeLabel: '3 hours ago',
    unread: false,
  },
  {
    tenantId: DEFAULT_TENANT_ID,
    id: 'dn-005',
    title: 'System update completed',
    detail: 'Automation rules synced successfully.',
    timeLabel: '1 day ago',
    unread: false,
  },
];

export const dashboardTenantsByRole: Record<UserRole, DashboardTenantSummary[]> = {
  SUPERADMIN: [
    {
      id: DEFAULT_TENANT_ID,
      name: 'AppointmentOS Control',
      role: 'SUPERADMIN',
      plan: 'enterprise',
    },
    {
      id: SECONDARY_TENANT_ID,
      name: 'Clinica Dental Sonrisa',
      role: 'ADMIN',
      plan: 'pro',
    },
  ],
  RESELLER: [
    {
      id: DEFAULT_TENANT_ID,
      name: 'Partner Growth Group',
      role: 'RESELLER',
      plan: 'pro',
    },
    {
      id: SECONDARY_TENANT_ID,
      name: 'Clinica Dental Sonrisa',
      role: 'ADMIN',
      plan: 'pro',
    },
  ],
  ADMIN: [
    {
      id: DEFAULT_TENANT_ID,
      name: 'Clinica Dental Sonrisa',
      role: 'ADMIN',
      plan: 'pro',
    },
  ],
  STAFF: [
    {
      id: DEFAULT_TENANT_ID,
      name: 'Clinica Dental Sonrisa',
      role: 'STAFF',
      plan: 'pro',
    },
  ],
  CLIENT: [
    {
      id: DEFAULT_TENANT_ID,
      name: 'Clinica Dental Sonrisa',
      role: 'CLIENT',
      plan: 'pro',
    },
  ],
};
