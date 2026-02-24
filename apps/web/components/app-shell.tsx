'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthenticated = status === 'authenticated' && !!user;

  return (
    <div className="site-wrapper">
      <div className="bg-glow bg-glow-top" />
      <div className="bg-glow bg-glow-side" />
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/" className="brand">
            AppointmentOS
          </Link>

          <button
            className="mobile-toggle"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            Menu
          </button>

          <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${active ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="button button-ghost" onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
                <Link href="/signup" className="button button-primary" onClick={() => setMenuOpen(false)}>
                  Start free
                </Link>
              </>
            ) : (
              <>
                <span className="role-chip">
                  {user.role} · {user.fullName}
                </span>
                <button
                  className="button button-ghost"
                  type="button"
                  onClick={() => {
                    void logout();
                    setMenuOpen(false);
                  }}
                >
                  Log out
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container page-content">{children}</main>
    </div>
  );
}
