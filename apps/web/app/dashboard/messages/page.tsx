'use client';

import { useMemo, useState } from 'react';
import { DashboardStateGuard } from '@/components/dashboard/dashboard-state-guard';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ModuleHeader } from '@/components/dashboard/module-header';
import {
  DEFAULT_TENANT_ID,
  messageLogsData,
  scopeByTenant,
} from '@/components/dashboard/mock-data';

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DashboardMessagesPage() {
  const tenantId = DEFAULT_TENANT_ID;
  const [search, setSearch] = useState('');
  const scopedLogs = useMemo(() => scopeByTenant(messageLogsData, tenantId), [tenantId]);

  const filteredLogs = useMemo(() => {
    const value = search.toLowerCase();
    return scopedLogs.filter((log) => {
      return (
        log.templateName.toLowerCase().includes(value) ||
        log.recipient.toLowerCase().includes(value) ||
        log.channel.toLowerCase().includes(value)
      );
    });
  }, [scopedLogs, search]);

  return (
    <DashboardStateGuard>
      <ModuleHeader
        title="Messages"
        description="Inspect message delivery logs and template usage across channels."
      />

      <div className="tenant-search-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="tenant-search-input"
          placeholder="Search logs by template, recipient, or channel..."
        />
      </div>

      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No message logs found"
          description="No records match your current filters."
        />
      ) : (
        <div className="tenant-table-shell">
          <div className="tenant-table-row tenant-table-head">
            <p className="tenant-table-heading">Channel</p>
            <p className="tenant-table-heading">Template</p>
            <p className="tenant-table-heading">Recipient</p>
            <p className="tenant-table-heading">Sent at</p>
            <p className="tenant-table-heading">Status</p>
          </div>
          {filteredLogs.map((log) => (
            <div key={log.id} className="tenant-table-row">
              <p className="tenant-table-cell">{log.channel}</p>
              <p className="tenant-table-cell">{log.templateName}</p>
              <p className="tenant-table-cell">{log.recipient}</p>
              <p className="tenant-table-cell">{formatDate(log.sentAtIso)}</p>
              <p className="tenant-table-cell">
                <span className={`tenant-badge ${log.status}`}>{log.status}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardStateGuard>
  );
}
