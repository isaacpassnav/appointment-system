'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardStateGuard } from '@/components/dashboard/dashboard-state-guard';
import { ModuleHeader } from '@/components/dashboard/module-header';
import {
  DEFAULT_TENANT_ID,
  automationsData,
  scopeByTenant,
} from '@/components/dashboard/mock-data';
import type { DashboardAutomation } from '@/components/dashboard/types';

export default function DashboardAutomationsPage() {
  const tenantId = DEFAULT_TENANT_ID;
  const [automations, setAutomations] = useState<DashboardAutomation[]>(
    scopeByTenant(automationsData, tenantId),
  );

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  };

  return (
    <DashboardStateGuard>
      <ModuleHeader
        title="Automations"
        description="Configure reminders, follow-ups, and email flows for appointment lifecycle."
      />

      <div className="tenant-panel">
        <h2 className="tenant-panel-title">Automation flows</h2>
        <div className="tenant-table-shell">
          <div className="tenant-table-row tenant-table-head">
            <p className="tenant-table-heading">Flow</p>
            <p className="tenant-table-heading">Channel</p>
            <p className="tenant-table-heading">Trigger</p>
            <p className="tenant-table-heading">Status</p>
            <p className="tenant-table-heading">Action</p>
          </div>

          {automations.map((automation) => (
            <div key={automation.id} className="tenant-table-row">
              <p className="tenant-table-cell">{automation.name}</p>
              <p className="tenant-table-cell">{automation.channel}</p>
              <p className="tenant-table-cell">{automation.trigger}</p>
              <p className="tenant-table-cell">
                <span
                  className={`tenant-badge ${automation.enabled ? 'confirmed' : 'canceled'}`}
                >
                  {automation.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </p>
              <div className="tenant-table-cell">
                <Button
                  variant="outline"
                  size="sm"
                  className="tenant-mini-btn"
                  onClick={() => toggleAutomation(automation.id)}
                >
                  {automation.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardStateGuard>
  );
}
