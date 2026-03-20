'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardStateGuard } from '@/components/dashboard/dashboard-state-guard';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ModuleHeader } from '@/components/dashboard/module-header';
import { TableSkeleton } from '@/components/dashboard/table-skeleton';
import {
  DEFAULT_TENANT_ID,
  appointmentsData,
  scopeByTenant,
} from '@/components/dashboard/mock-data';
import type { DashboardAppointmentStatus } from '@/components/dashboard/types';

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DashboardAppointmentsPage() {
  const tenantId = DEFAULT_TENANT_ID;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DashboardAppointmentStatus>(
    'all',
  );
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  const scopedAppointments = useMemo(
    () => scopeByTenant(appointmentsData, tenantId),
    [tenantId],
  );

  const filteredAppointments = useMemo(() => {
    return scopedAppointments.filter((item) => {
      const matchesSearch =
        item.customerName.toLowerCase().includes(search.toLowerCase()) ||
        item.serviceName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [scopedAppointments, search, statusFilter]);

  const onAction = (action: string, customerName: string) => {
    setActionMessage(`${action} requested for ${customerName}.`);
  };

  return (
    <DashboardStateGuard>
      <ModuleHeader
        title="Appointments"
        description="Manage customer bookings with status, payment, and quick actions."
      />

      <div className="tenant-search-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customer or service..."
          className="tenant-search-input"
        />
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as 'all' | DashboardAppointmentStatus)
          }
          className="tenant-filter-select"
        >
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      {actionMessage ? (
        <p className="text-sm text-muted-foreground">{actionMessage}</p>
      ) : null}

      {loading ? (
        <TableSkeleton rows={7} />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description="Try another search or adjust your filters."
        />
      ) : (
        <div className="tenant-table-shell">
          <div className="tenant-table-row tenant-table-head">
            <p className="tenant-table-heading">Customer</p>
            <p className="tenant-table-heading">Service</p>
            <p className="tenant-table-heading">Date</p>
            <p className="tenant-table-heading">Status</p>
            <p className="tenant-table-heading">Payment</p>
          </div>

          {filteredAppointments.map((item) => (
            <div className="tenant-table-row" key={item.id}>
              <p className="tenant-table-cell">{item.customerName}</p>
              <p className="tenant-table-cell">{item.serviceName}</p>
              <p className="tenant-table-cell">{formatDate(item.dateIso)}</p>
              <p className="tenant-table-cell">
                <span className={`tenant-badge ${item.status}`}>{item.status}</span>
              </p>
              <div className="tenant-table-cell">
                <span className={`tenant-badge ${item.paymentStatus}`}>
                  {item.paymentStatus}
                </span>
                <div className="tenant-row-actions mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="tenant-mini-btn"
                    onClick={() => onAction('Edit', item.customerName)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="tenant-mini-btn"
                    onClick={() => onAction('Cancel', item.customerName)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="tenant-mini-btn"
                    onClick={() => onAction('Reschedule', item.customerName)}
                  >
                    Reschedule
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardStateGuard>
  );
}
