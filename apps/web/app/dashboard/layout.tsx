'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bot,
  Building2,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  Store,
  Users,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { UserRole } from '@/lib/types';
import './dashboard.css';

// Navigation items by role
const navigationConfig: Record<
  UserRole,
  Array<{ href: string; label: string; icon: React.ComponentType<{ size?: number }> }>
> = {
  SUPERADMIN: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/tenants', label: 'Tenants', icon: Building2 },
    { href: '/dashboard/resellers', label: 'Resellers', icon: Store },
    { href: '/dashboard/users', label: 'Users', icon: Users },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/system', label: 'System', icon: Shield },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ],
  RESELLER: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/my-tenants', label: 'My Tenants', icon: Building2 },
    { href: '/dashboard/customers', label: 'Customers', icon: Users },
    { href: '/dashboard/quotas', label: 'Quotas', icon: BarChart3 },
    { href: '/dashboard/analytics', label: 'Reports', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ],
  ADMIN: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/appointments', label: 'Appointments', icon: CalendarDays },
    { href: '/dashboard/customers', label: 'Customers', icon: Users },
    { href: '/dashboard/services', label: 'Services', icon: Wrench },
    { href: '/dashboard/staff', label: 'Staff', icon: Users },
    { href: '/dashboard/automations', label: 'Automations', icon: Bot },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ],
  STAFF: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/appointments', label: 'Appointments', icon: CalendarDays },
    { href: '/dashboard/customers', label: 'Customers', icon: Users },
    { href: '/dashboard/services', label: 'Services', icon: Wrench },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ],
  CLIENT: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/appointments', label: 'My Appointments', icon: CalendarDays },
    { href: '/dashboard/book', label: 'Book Appointment', icon: CalendarDays },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ],
};

function isActive(currentPath: string, href: string) {
  if (href === '/dashboard') {
    return currentPath === href;
  }
  return currentPath.startsWith(href);
}

function TenantSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  // TODO: Fetch user's tenants from API
  const tenants = [
    { id: '1', name: 'Acme Clinic', role: 'ADMIN' },
    { id: '2', name: 'Beauty Studio', role: 'STAFF' },
  ];
  const currentTenant = tenants[0];

  return (
    <div className="tenant-switcher">
      <button
        className="tenant-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="tenant-switcher-info">
          <span className="tenant-switcher-name">{currentTenant?.name}</span>
          <span className="tenant-switcher-role">{currentTenant?.role}</span>
        </div>
        <ChevronDown size={14} className={`tenant-switcher-chevron${isOpen ? ' open' : ''}`} />
      </button>

      {isOpen && (
        <div className="tenant-switcher-dropdown">
          <div className="tenant-switcher-label">Switch workspace</div>
          {tenants.map((tenant) => (
            <button
              key={tenant.id}
              className={`tenant-switcher-option${
                tenant.id === currentTenant?.id ? ' active' : ''
              }`}
              onClick={() => {
                // TODO: Switch tenant context
                setIsOpen(false);
              }}
            >
              <span className="tenant-switcher-option-name">{tenant.name}</span>
              <span className="tenant-switcher-option-role">{tenant.role}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const colors: Record<UserRole, string> = {
    SUPERADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
    RESELLER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    ADMIN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    STAFF: 'bg-green-500/20 text-green-400 border-green-500/30',
    CLIENT: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <span className={`role-badge ${colors[role]}`}>
      {role.toLowerCase()}
    </span>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role || 'CLIENT';
  const navItems = navigationConfig[userRole];

  return (
    <section className="tenant-dashboard-layout">
      <aside className="tenant-sidebar">
        <div className="tenant-sidebar-header">
          <p className="tenant-sidebar-title">
            {userRole === 'SUPERADMIN' && 'Admin Console'}
            {userRole === 'RESELLER' && 'Reseller Hub'}
            {userRole === 'ADMIN' && 'Business Dashboard'}
            {userRole === 'STAFF' && 'Staff Portal'}
            {userRole === 'CLIENT' && 'My Account'}
          </p>
          <RoleBadge role={userRole} />
        </div>

        {/* Show tenant switcher for users with multiple tenant access */}
        {(userRole === 'SUPERADMIN' || userRole === 'RESELLER') && <TenantSwitcher />}

        <nav className="tenant-nav">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`tenant-nav-link${isActive(pathname, href) ? ' active' : ''}`}
            >
              <Icon size={16} aria-hidden />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="tenant-main">
        <div className="tenant-mobile-nav">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`tenant-mobile-link${isActive(pathname, href) ? ' active' : ''}`}
            >
              <Icon size={14} aria-hidden />
              <span>{label}</span>
            </Link>
          ))}
        </div>
        {children}
      </div>
    </section>
  );
}
