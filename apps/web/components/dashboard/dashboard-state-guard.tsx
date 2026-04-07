'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

export function DashboardStateGuard({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="tenant-dashboard-loading">
        <div className="tenant-skeleton h-10 w-40" />
        <div className="tenant-skeleton h-52 w-full" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <Card className="border-slate-200 bg-white text-slate-950 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-950">You are not logged in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Sign in to access tenant modules and analytics.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Create account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
