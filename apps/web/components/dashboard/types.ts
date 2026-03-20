export type TenantScoped = {
  tenantId: string;
};

export type DashboardAppointmentStatus =
  | 'confirmed'
  | 'pending'
  | 'canceled';

export type PaymentStatus = 'paid' | 'pending' | 'failed';

export type DashboardAppointment = TenantScoped & {
  id: string;
  customerName: string;
  serviceName: string;
  dateIso: string;
  status: DashboardAppointmentStatus;
  paymentStatus: PaymentStatus;
  amount: number;
};

export type DashboardCustomer = TenantScoped & {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisitIso: string;
  totalSpent: number;
};

export type DashboardService = TenantScoped & {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  availability: string;
  isActive: boolean;
};

export type DashboardAutomation = TenantScoped & {
  id: string;
  name: string;
  channel: 'Email' | 'WhatsApp' | 'SMS';
  trigger: string;
  enabled: boolean;
};

export type DashboardMessageLog = TenantScoped & {
  id: string;
  channel: 'Email' | 'WhatsApp' | 'Telegram';
  templateName: string;
  recipient: string;
  sentAtIso: string;
  status: 'sent' | 'queued' | 'failed';
};

export type DashboardActivity = TenantScoped & {
  id: string;
  kind: 'appointment' | 'customer' | 'cancellation';
  title: string;
  detail: string;
  timestampIso: string;
};

export type DashboardTrendPoint = TenantScoped & {
  label: string;
  bookings: number;
  revenue: number;
  conversionRate: number;
  customerGrowth: number;
};
