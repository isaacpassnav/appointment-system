import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder-page';

export default function DashboardResellersPage() {
  return (
    <DashboardPlaceholderPage
      title="Resellers"
      description="Review reseller performance, quotas, and managed tenants."
      emptyTitle="Reseller controls are being assembled"
      emptyDescription="This route is reserved for multi-layer SaaS operations and will be connected to real billing and quota data."
    />
  );
}
