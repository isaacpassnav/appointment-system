'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AOS from 'aos';
import { FaGithub, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status, user, logout } = useAuth();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/dashboard', label: t('nav.dashboard') },
  ];

  const isAuthenticated = status === 'authenticated' && !!user;

  useEffect(() => {
    AOS.init({ once: true, duration: 700, easing: 'ease-out-cubic', offset: 80 });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="site-wrapper">
      <div className="bg-layer" aria-hidden="true">
        <div className="bg-glow bg-glow-top" />
        <div className="bg-glow bg-glow-side" />
        <div className="bg-grid" />
      </div>
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
            aria-label={t('nav.menu')}
          >
            <span className="sr-only">{t('nav.menu')}</span>
            <span className={`hamburger ${menuOpen ? 'open' : ''}`} aria-hidden="true" />
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
                <LanguageSwitcher />
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    {t('nav.login')}
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup" onClick={() => setMenuOpen(false)}>
                    {t('nav.signup')}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <Badge variant="secondary" className="role-chip">
                  {user.role} - {user.fullName}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                    void logout();
                    setMenuOpen(false);
                  }}
                >
                  {t('nav.logout')}
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container page-content">{children}</main>

      <footer className="footer" data-aos="fade-up">
        <div className="container footer-grid">
          <div className="footer-brand">
            <p className="brand">AppointmentOS</p>
            <p className="muted">{t('footer.tagline')}</p>
            <p className="footer-mail">
              <a href="mailto:pasapera279@gmail.com">pasapera279@gmail.com</a>
            </p>
          </div>

          <div className="footer-col">
            <p className="footer-title">{t('footer.product')}</p>
            <a href="/dashboard">{t('footer.dashboard')}</a>
            <a href="/login">{t('footer.login')}</a>
            <a href="/signup">{t('footer.signup')}</a>
          </div>

          <div className="footer-col">
            <p className="footer-title">{t('footer.social')}</p>
            <div className="social-row">
              <a
                href="https://www.linkedin.com/in/isaac-pasapera-navarro/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn aria-hidden="true" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="https://github.com/isaacpassnav" target="_blank" rel="noreferrer" aria-label="GitHub">
                <FaGithub aria-hidden="true" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://www.instagram.com/isaacpasapera/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram aria-hidden="true" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://x.com/IsaacPasapera" target="_blank" rel="noreferrer" aria-label="X">
                <FaXTwitter aria-hidden="true" />
                <span className="sr-only">X</span>
              </a>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
