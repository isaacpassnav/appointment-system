import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder-page';

export default function DashboardAvailabilityPage() {
  return (
    <DashboardPlaceholderPage
      title="Availability"
      description="Define time slots, blackout rules, and operating hours."
      emptyTitle="Availability rules are being prepared"
      emptyDescription="This screen will manage slot-based scheduling, team calendars, and service windows."
    />
  );
}
