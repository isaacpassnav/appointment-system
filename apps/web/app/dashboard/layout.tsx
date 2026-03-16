'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FaGauge, FaGear } from 'react-icons/fa6';
import { useAuth } from '@/providers/auth-provider';

const navItems = [
  { href: '/dashboard', Icon: FaGauge, labelKey: 'dashNav.overview', exact: true },
  { href: '/dashboard/settings', Icon: FaGear, labelKey: 'dashNav.settings', exact: false },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { status } = useAuth();

  const showSidebar = status === 'authenticated';

  return (
    <div className={`dash-layout${showSidebar ? ' has-sidebar' : ''}`}>
      {showSidebar && (
        <aside className="dash-sidebar">
          <p className="dash-sidebar-label">{t('dashNav.label')}</p>
          <nav className="dash-sidebar-nav">
            {navItems.map(({ href, Icon, labelKey, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`dash-nav-item${active ? ' active' : ''}`}
                  title={t(labelKey)}
                >
                  <Icon className="dash-nav-icon" aria-hidden />
                  <span className="dash-nav-label">{t(labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      <div className="dash-right">
        {showSidebar && (
          <div className="dash-mobile-tabs">
            {navItems.map(({ href, Icon, labelKey, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`dash-tab-link${active ? ' active' : ''}`}
                >
                  <Icon aria-hidden />
                  <span>{t(labelKey)}</span>
                </Link>
              );
            })}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
