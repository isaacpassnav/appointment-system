import type { Metadata } from 'next';
import { Space_Grotesk, Source_Sans_3 } from 'next/font/google';
import { AppShell } from '@/components/app-shell';
import { AuthProvider } from '@/providers/auth-provider';
import { I18nProvider } from '@/providers/i18n-provider';
import './globals.css';
import 'aos/dist/aos.css';

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['500', '600', '700'],
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'AppointmentOS Frontend',
  description:
    'Professional scheduling frontend with auth, dashboard, and appointment flows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <I18nProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
