import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder-page';

export default function DashboardAuditLogPage() {
  return (
    <DashboardPlaceholderPage
      title="Audit Log"
      description="Review critical account, tenant, and automation events."
      emptyTitle="Audit log view is pending"
      emptyDescription="We will surface role-sensitive activity history here once audit events are fully persisted."
    />
  );
}
