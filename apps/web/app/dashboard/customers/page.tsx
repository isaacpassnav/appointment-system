'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardStateGuard } from '@/components/dashboard/dashboard-state-guard';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ModuleHeader } from '@/components/dashboard/module-header';
import { TableSkeleton } from '@/components/dashboard/table-skeleton';
import {
  DEFAULT_TENANT_ID,
  customersData,
  scopeByTenant,
} from '@/components/dashboard/mock-data';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardCustomersPage() {
  const tenantId = DEFAULT_TENANT_ID;
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  const scopedCustomers = useMemo(() => scopeByTenant(customersData, tenantId), [tenantId]);
  const filteredCustomers = useMemo(() => {
    return scopedCustomers.filter((customer) => {
      const value = search.toLowerCase();
      return (
        customer.name.toLowerCase().includes(value) ||
        customer.email.toLowerCase().includes(value) ||
        customer.phone.toLowerCase().includes(value)
      );
    });
  }, [scopedCustomers, search]);

  const onAction = (action: string, name: string) => {
    setActionMessage(`${action} requested for ${name}.`);
  };

  return (
    <DashboardStateGuard>
      <ModuleHeader
        title="Customers (CRM)"
        description="Track customer records, lifetime value, and retention signals."
      />

      <div className="tenant-search-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email, or phone..."
          className="tenant-search-input"
        />
      </div>

      {actionMessage ? (
        <p className="text-sm text-muted-foreground">{actionMessage}</p>
      ) : null}

      {loading ? (
        <TableSkeleton rows={6} />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Try a different search query."
        />
      ) : (
        <div className="tenant-table-shell">
          <div className="tenant-table-row tenant-table-head">
            <p className="tenant-table-heading">Name</p>
            <p className="tenant-table-heading">Email</p>
            <p className="tenant-table-heading">Phone</p>
            <p className="tenant-table-heading">Last visit</p>
            <p className="tenant-table-heading">Total spent</p>
          </div>

          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="tenant-table-row">
              <p className="tenant-table-cell">{customer.name}</p>
              <p className="tenant-table-cell">{customer.email}</p>
              <p className="tenant-table-cell">{customer.phone}</p>
              <p className="tenant-table-cell">{formatDate(customer.lastVisitIso)}</p>
              <div className="tenant-table-cell">
                {formatCurrency(customer.totalSpent)}
                <div className="tenant-row-actions mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="tenant-mini-btn"
                    onClick={() => onAction('View profile', customer.name)}
                  >
                    View profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="tenant-mini-btn"
                    onClick={() => onAction('Edit', customer.name)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="tenant-mini-btn"
                    onClick={() => onAction('View history', customer.name)}
                  >
                    View history
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
