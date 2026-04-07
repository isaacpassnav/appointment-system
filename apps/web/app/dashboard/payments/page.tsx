import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder-page';

export default function DashboardPaymentsPage() {
  return (
    <DashboardPlaceholderPage
      title="Payments"
      description="Track invoices, payment status, and payout flows."
      emptyTitle="Payments module is not live yet"
      emptyDescription="The shell is ready for plan-based access. Next we connect Stripe and MercadoPago flows."
    />
  );
}
