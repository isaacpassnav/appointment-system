'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bot,
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  Wrench,
} from 'lucide-react';
import './dashboard.css';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/services', label: 'Services', icon: Wrench },
  { href: '/dashboard/automations', label: 'Automations', icon: Bot },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const;

function isActive(currentPath: string, href: string) {
  if (href === '/dashboard') {
    return currentPath === href;
  }
  return currentPath.startsWith(href);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <section className="tenant-dashboard-layout">
      <aside className="tenant-sidebar">
        <p className="tenant-sidebar-title">Tenant Console</p>
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
