import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder-page';

export default function DashboardFeatureFlagsPage() {
  return (
    <DashboardPlaceholderPage
      title="Feature Flags"
      description="Toggle platform capabilities safely per environment or tenant."
      emptyTitle="Feature flags panel pending"
      emptyDescription="This route will expose rollout controls for AI, notifications, and premium modules."
    />
  );
}
