import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder-page';

export default function DashboardBillingPage() {
  return (
    <DashboardPlaceholderPage
      title="Plans & Billing"
      description="Manage subscription tiers, reseller pricing, and billing logic."
      emptyTitle="Billing controls are not connected yet"
      emptyDescription="The dashboard is ready to host plan management once the billing backend is wired."
    />
  );
}
