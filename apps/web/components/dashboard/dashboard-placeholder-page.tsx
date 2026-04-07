'use client';

import Link from 'next/link';
import { DashboardStateGuard } from '@/components/dashboard/dashboard-state-guard';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ModuleHeader } from '@/components/dashboard/module-header';
import { Button } from '@/components/ui/button';

export function DashboardPlaceholderPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <DashboardStateGuard>
      <ModuleHeader
        title={title}
        description={description}
        actions={
          <Button asChild size="sm" variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <Link href="/#pricing">View plans</Link>
          </Button>
        }
      />

      <EmptyState title={emptyTitle} description={emptyDescription} />
    </DashboardStateGuard>
  );
}
