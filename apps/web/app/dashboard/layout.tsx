'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  BadgeDollarSign,
  Bell,
  Bot,
  Building2,
  CalendarClock,
  CalendarDays,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  Lock,
  MessageSquare,
  PlugZap,
  ReceiptText,
  Settings,
  Shield,
  Sparkles,
  Store,
  UserCircle2,
  Users,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { dashboardNotifications, dashboardTenantsByRole } from '@/components/dashboard/mock-data';
import type { DashboardTenantSummary } from '@/components/dashboard/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  canAccessFeature,
  getRequiredPlanForFeature,
  type PlanFeatureKey,
  type TenantPlan,
} from '@/lib/plan-features';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import './dashboard.css';

type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  feature?: PlanFeatureKey;
  comingSoon?: boolean;
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPERADMIN', 'RESELLER', 'ADMIN', 'STAFF', 'CLIENT'] },
      { label: 'Calendar', href: '/dashboard/calendar', icon: CalendarClock, roles: ['ADMIN', 'STAFF'] },
      { label: 'Book Appointment', href: '/dashboard/book', icon: CalendarDays, roles: ['CLIENT'] },
      { label: 'My Appointments', href: '/dashboard/appointments', icon: CalendarDays, roles: ['CLIENT', 'STAFF'] },
    ],
  },
  {
    title: 'Manage',
    items: [
      { label: 'Appointments', href: '/dashboard/appointments', icon: CalendarDays, roles: ['ADMIN', 'STAFF'] },
      { label: 'Clients', href: '/dashboard/customers', icon: Users, roles: ['ADMIN'], feature: 'clients' },
      { label: 'Services', href: '/dashboard/services', icon: Wrench, roles: ['ADMIN'] },
      { label: 'Staff', href: '/dashboard/staff', icon: Users, roles: ['ADMIN'], feature: 'staff' },
      { label: 'Availability', href: '/dashboard/availability', icon: CalendarClock, roles: ['ADMIN', 'STAFF'] },
    ],
  },
  {
    title: 'Automation',
    items: [
      { label: 'Email Templates', href: '/dashboard/messages', icon: MessageSquare, roles: ['ADMIN'], feature: 'emailTemplates' },
      { label: 'Reminders', href: '/dashboard/automations', icon: Bell, roles: ['ADMIN'], feature: 'reminders' },
      { label: 'AI Agent', href: '/dashboard/automations', icon: Bot, roles: ['ADMIN'], feature: 'aiAgent', comingSoon: true },
    ],
  },
  {
    title: 'Business',
    items: [
      { label: 'Payments', href: '/dashboard/payments', icon: CreditCard, roles: ['ADMIN'], feature: 'payments' },
      { label: 'Reports', href: '/dashboard/analytics', icon: BadgeDollarSign, roles: ['ADMIN'], feature: 'reports' },
      { label: 'Integrations', href: '/dashboard/integrations', icon: PlugZap, roles: ['ADMIN'], feature: 'integrations' },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Tenants', href: '/dashboard/tenants', icon: Building2, roles: ['SUPERADMIN', 'RESELLER'] },
      { label: 'Resellers', href: '/dashboard/resellers', icon: Store, roles: ['SUPERADMIN'] },
      { label: 'Plans & Billing', href: '/dashboard/billing', icon: ReceiptText, roles: ['SUPERADMIN', 'RESELLER'] },
      { label: 'Feature Flags', href: '/dashboard/feature-flags', icon: Sparkles, roles: ['SUPERADMIN'] },
      { label: 'Audit Log', href: '/dashboard/audit-log', icon: Shield, roles: ['SUPERADMIN'] },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] },
      { label: 'Profile', href: '/dashboard/profile', icon: UserCircle2, roles: ['SUPERADMIN', 'RESELLER', 'ADMIN', 'STAFF', 'CLIENT'] },
      { label: 'Help & Support', href: '/dashboard/help', icon: HelpCircle, roles: ['SUPERADMIN', 'RESELLER', 'ADMIN', 'STAFF', 'CLIENT'] },
    ],
  },
];

const ROLE_LABELS: Record<UserRole, string> = {
  SUPERADMIN: 'Superadmin',
  RESELLER: 'Reseller',
  ADMIN: 'Business Admin',
  STAFF: 'Staff',
  CLIENT: 'Client',
};

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function isActive(currentPath: string, href: string) {
  if (href === '/dashboard') {
    return currentPath === href;
  }

  return currentPath.startsWith(href);
}

function getPlanBadge(plan: TenantPlan, trialDaysLeft?: number) {
  if (plan === 'trial') {
    return {
      className: 'border-amber-200 bg-amber-100 text-amber-700',
      label: `${trialDaysLeft ?? 7} days left · Upgrade`,
    };
  }

  if (plan === 'enterprise') {
    return {
      className: 'border-amber-200 bg-amber-50 text-amber-700',
      label: 'Enterprise',
    };
  }

  if (plan === 'pro') {
    return {
      className: 'border-violet-200 bg-violet-100 text-violet-700',
      label: 'Pro',
    };
  }

  return {
    className: 'border-slate-200 bg-slate-100 text-slate-700',
    label: 'Starter',
  };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userRole = user?.role ?? 'CLIENT';
  const tenants = dashboardTenantsByRole[userRole];
  const currentTenant = tenants[0] as DashboardTenantSummary | undefined;
  const currentPlan = currentTenant?.plan ?? 'starter';
  const tenantNotifications = dashboardNotifications
    .filter((notification) => notification.tenantId === currentTenant?.id)
    .slice(0, 5);
  const unreadCount = tenantNotifications.filter((notification) => notification.unread).length;
  const planBadge = getPlanBadge(currentPlan, currentTenant?.trialDaysLeft);

  const visibleSections = useMemo(() => {
    return SIDEBAR_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(userRole)),
    })).filter((section) => section.items.length > 0);
  }, [userRole]);

  const mobileItems = useMemo(() => {
    return visibleSections
      .flatMap((section) => section.items)
      .filter((item, index, collection) => collection.findIndex((entry) => entry.href === item.href) === index)
      .slice(0, 8);
  }, [visibleSections]);

  const avatarInitials = getInitials(user?.fullName || currentTenant?.name || 'AO');
  const tenantInitials = getInitials(currentTenant?.name || 'AppointmentOS');
  const formatPlanName = (plan: TenantPlan) =>
    plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <section className="space-y-5">
      <header className="rounded-[28px] bg-gradient-to-r from-violet-700 via-violet-600 to-violet-500 px-4 py-3 text-white shadow-[0_24px_48px_rgba(109,40,217,0.18)] sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {currentTenant?.logoSrc ? (
              <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-white/30">
                <Image
                  src={currentTenant.logoSrc}
                  alt={currentTenant.name}
                  fill={true}
                  sizes="44px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-800 text-sm font-bold text-white ring-2 ring-white/25">
                {tenantInitials}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-base font-semibold sm:text-lg">
                {currentTenant?.name ?? 'Active workspace'}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                {ROLE_LABELS[currentTenant?.role ?? userRole]}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <LanguageSwitcher
              className="border border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              menuClassName="border-slate-200 bg-white text-slate-900 shadow-xl"
            />

            <DropdownMenu>
              <DropdownMenuTrigger
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/15"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" aria-hidden={true} />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-[11px] font-bold text-slate-900">
                    {unreadCount}
                  </span>
                ) : null}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[340px] border-slate-200 bg-white p-2 text-slate-900 shadow-xl">
                <DropdownMenuLabel className="px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                  Recent notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tenantNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex cursor-default items-start gap-3 rounded-xl px-3 py-3 focus:bg-slate-50"
                  >
                    <span className={cn('mt-1 h-2.5 w-2.5 rounded-full', notification.unread ? 'bg-violet-600' : 'bg-slate-300')} />
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                      <p className="text-xs leading-5 text-slate-500">{notification.detail}</p>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        {notification.timeLabel}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/#pricing" className={cn('inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]', planBadge.className)}>
              {planBadge.label}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2 py-1.5 text-left text-white transition hover:bg-white/15">
                {user?.avatarUrl ? (
                  <div className="relative h-9 w-9 overflow-hidden rounded-full bg-slate-200">
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName}
                      fill={true}
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-300 text-sm font-semibold text-slate-800">
                    {avatarInitials}
                  </div>
                )}
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-semibold">{user?.fullName ?? 'Account'}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">
                    {ROLE_LABELS[userRole]}
                  </p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-slate-200 bg-white p-2 text-slate-900 shadow-xl">
                <DropdownMenuLabel className="px-3 py-2">
                  <p className="text-sm font-semibold">{user?.fullName ?? 'Account'}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 focus:bg-slate-50">
                  <Link href="/dashboard/profile">My profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 focus:bg-slate-50">
                  <Link href="/dashboard/settings">Account settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-xl px-3 py-2.5 text-rose-600 focus:bg-rose-50"
                  onClick={() => {
                    void logout();
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="tenant-dashboard-layout">
        <aside className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-5">
            {visibleSections.map((section) => (
              <div key={section.title} className="space-y-2.5">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {section.title}
                </p>
                <div className="grid gap-1.5">
                  {section.items.map((item) => {
                    const locked = item.feature ? !canAccessFeature(currentPlan, item.feature) : false;
                    const requiredPlan = item.feature ? getRequiredPlanForFeature(item.feature) : null;
                    const active = !locked && isActive(pathname, item.href);
                    const commonClasses =
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition';

                    return (
                      <div key={item.href} className="group relative">
                        <Link
                          href={locked ? '/#pricing' : item.href}
                          className={cn(
                            commonClasses,
                            active
                              ? 'bg-violet-600 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                            locked && 'opacity-50',
                          )}
                          title={locked && requiredPlan ? `Available on ${formatPlanName(requiredPlan)} plan` : undefined}
                        >
                          <item.icon
                            className={cn(
                              'h-4 w-4 flex-shrink-0',
                              active ? 'text-white' : 'text-slate-400',
                            )}
                            aria-hidden={true}
                          />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.comingSoon && !locked ? (
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700">
                              Coming soon
                            </span>
                          ) : null}
                          {locked ? <Lock className="h-4 w-4 flex-shrink-0" aria-hidden={true} /> : null}
                        </Link>

                        {locked && requiredPlan ? (
                          <div className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-950 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                            {`Available on ${formatPlanName(requiredPlan)} plan`}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {(currentPlan === 'starter' || currentPlan === 'trial') && (
              <div className="rounded-[22px] border border-violet-200 bg-violet-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Upgrade to unlock the full stack
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Get clients, staff, reminders, payments, and integrations in one dashboard.
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/#pricing">Upgrade to Pro</Link>
                </Button>
              </div>
            )}
          </div>
        </aside>

        <div className="tenant-main">
          <div className="tenant-mobile-nav">
            {mobileItems.map((item) => {
              const locked = item.feature ? !canAccessFeature(currentPlan, item.feature) : false;
              return (
                <Link
                  key={item.href}
                  href={locked ? '/#pricing' : item.href}
                  className={`tenant-mobile-link${!locked && isActive(pathname, item.href) ? ' active' : ''}${locked ? ' opacity-50' : ''}`}
                >
                  <item.icon size={14} aria-hidden />
                  <span>{item.label}</span>
                  {locked ? <Lock size={12} aria-hidden /> : null}
                </Link>
              );
            })}
          </div>

          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </section>
  );
}
