'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardStateGuard } from '@/components/dashboard/dashboard-state-guard';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ModuleHeader } from '@/components/dashboard/module-header';
import {
  DEFAULT_TENANT_ID,
  scopeByTenant,
  servicesData,
} from '@/components/dashboard/mock-data';
import type { DashboardService } from '@/components/dashboard/types';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardServicesPage() {
  const tenantId = DEFAULT_TENANT_ID;
  const [services, setServices] = useState<DashboardService[]>(
    scopeByTenant(servicesData, tenantId),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    price: 0,
    durationMinutes: 30,
    availability: '',
  });

  const hasServices = services.length > 0;
  const editingService = useMemo(
    () => services.find((item) => item.id === editingId) ?? null,
    [editingId, services],
  );

  const resetForm = () => {
    setForm({ name: '', price: 0, durationMinutes: 30, availability: '' });
    setEditingId(null);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingService) {
      setServices((prev) =>
        prev.map((item) =>
          item.id === editingService.id
            ? {
                ...item,
                name: form.name,
                price: form.price,
                durationMinutes: form.durationMinutes,
                availability: form.availability,
              }
            : item,
        ),
      );
      resetForm();
      return;
    }

    const newService: DashboardService = {
      id: `s-${Date.now()}`,
      tenantId,
      name: form.name,
      price: form.price,
      durationMinutes: form.durationMinutes,
      availability: form.availability,
      isActive: true,
    };

    setServices((prev) => [newService, ...prev]);
    resetForm();
  };

  const startEdit = (service: DashboardService) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
      availability: service.availability,
    });
  };

  return (
    <DashboardStateGuard>
      <ModuleHeader
        title="Services"
        description="Create and maintain service catalog with price, duration, and availability."
      />

      <div className="tenant-grid-2">
        <div className="tenant-panel">
          <h2 className="tenant-panel-title">
            {editingService ? 'Edit service' : 'Create service'}
          </h2>
          <form className="grid gap-3" onSubmit={onSubmit}>
            <input
              className="tenant-search-input"
              placeholder="Service name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
            <input
              className="tenant-search-input"
              type="number"
              min={0}
              placeholder="Price"
              value={form.price}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, price: Number(event.target.value) }))
              }
              required
            />
            <input
              className="tenant-search-input"
              type="number"
              min={5}
              step={5}
              placeholder="Duration (minutes)"
              value={form.durationMinutes}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  durationMinutes: Number(event.target.value),
                }))
              }
              required
            />
            <input
              className="tenant-search-input"
              placeholder="Availability (example: Mon-Fri 09:00-18:00)"
              value={form.availability}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, availability: event.target.value }))
              }
              required
            />
            <div className="tenant-module-actions">
              <Button type="submit">{editingService ? 'Save changes' : 'Create service'}</Button>
              {editingService ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="tenant-panel">
          <h2 className="tenant-panel-title">Service catalog</h2>
          {!hasServices ? (
            <EmptyState
              title="No services yet"
              description="Create your first service to enable booking options."
            />
          ) : (
            <div className="tenant-table-shell">
              <div className="tenant-table-row tenant-table-head">
                <p className="tenant-table-heading">Service</p>
                <p className="tenant-table-heading">Price</p>
                <p className="tenant-table-heading">Duration</p>
                <p className="tenant-table-heading">Availability</p>
                <p className="tenant-table-heading">Actions</p>
              </div>
              {services.map((service) => (
                <div key={service.id} className="tenant-table-row">
                  <p className="tenant-table-cell">{service.name}</p>
                  <p className="tenant-table-cell">{formatCurrency(service.price)}</p>
                  <p className="tenant-table-cell">{service.durationMinutes} min</p>
                  <p className="tenant-table-cell">{service.availability}</p>
                  <div className="tenant-table-cell">
                    <div className="tenant-row-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        className="tenant-mini-btn"
                        onClick={() => startEdit(service)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="tenant-mini-btn"
                        onClick={() =>
                          setServices((prev) => prev.filter((item) => item.id !== service.id))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardStateGuard>
  );
}
