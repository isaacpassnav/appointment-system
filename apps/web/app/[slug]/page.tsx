import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type MarketingPage = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  ctaPrimary: string;
  ctaSecondary: string;
};

const pages: Record<string, MarketingPage> = {
  'appointment-system': {
    eyebrow: 'Product',
    title: 'Appointment System',
    description:
      'End-to-end booking experience for teams, clients, and resellers with tenant-safe operations.',
    bullets: [
      'Conflict validation and clean booking flows',
      'Reminders and verification via email/WhatsApp',
      'Role-aware dashboards and tenant controls',
    ],
    ctaPrimary: 'Create account',
    ctaSecondary: 'See pricing',
  },
  'web-development': {
    eyebrow: 'Service',
    title: 'Web Development',
    description:
      'Professional websites and SaaS frontends optimized for conversion, speed, and maintainability.',
    bullets: [
      'Next.js + TypeScript architecture',
      'Responsive, SEO-ready pages',
      'Design system with reusable components',
    ],
    ctaPrimary: 'Start project',
    ctaSecondary: 'Back to home',
  },
  'ai-automation': {
    eyebrow: 'Service',
    title: 'AI Automation',
    description:
      'Automate repetitive communication and operations using structured AI workflows.',
    bullets: [
      'Intent detection and guided action flows',
      'Human-in-the-loop validation',
      'Analytics and cost-control from day one',
    ],
    ctaPrimary: 'Book discovery',
    ctaSecondary: 'Back to home',
  },
  'mobile-development': {
    eyebrow: 'Service',
    title: 'Mobile Development',
    description:
      'Cross-platform mobile experiences connected to your booking and CRM backend.',
    bullets: [
      'React Native-ready architecture',
      'Push notifications and auth flows',
      'Production release support',
    ],
    ctaPrimary: 'Discuss mobile app',
    ctaSecondary: 'Back to home',
  },
  stories: {
    eyebrow: 'Resources',
    title: 'Customer Stories',
    description:
      'Examples of businesses improving show-rate, reducing no-shows, and scaling through reseller models.',
    bullets: [
      'Real before/after adoption metrics',
      'Operational and revenue outcomes',
      'Replication playbooks by industry',
    ],
    ctaPrimary: 'Start free',
    ctaSecondary: 'Back to home',
  },
  about: {
    eyebrow: 'Company',
    title: 'About AppointmentOS',
    description:
      'We build a practical multi-tenant SaaS platform focused on measurable business outcomes.',
    bullets: [
      'Security-first architecture',
      'Scalable reseller model design',
      'Fast iteration with production quality',
    ],
    ctaPrimary: 'View product',
    ctaSecondary: 'Back to home',
  },
  help: {
    eyebrow: 'Support',
    title: 'Help Center',
    description:
      'Documentation and support guidance to onboard teams and troubleshoot quickly.',
    bullets: [
      'Setup and deployment guides',
      'Auth and tenant troubleshooting',
      'Integrations and notification flows',
    ],
    ctaPrimary: 'Go to FAQ',
    ctaSecondary: 'Back to home',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Talk with us',
    description:
      'Let us know your use case and we will define the fastest rollout path for your business.',
    bullets: [
      'Architecture and roadmap advisory',
      'Implementation and customization',
      'Support for launch and scale',
    ],
    ctaPrimary: 'Write by WhatsApp',
    ctaSecondary: 'Back to home',
  },
};

export default async function MarketingSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = pages[slug];

  if (!page) {
    notFound();
  }

  return (
    <section className="auth-wrap reveal">
      <Card className="auth-card" style={{ width: 'min(760px, 94vw)' }}>
        <CardHeader>
          <Badge variant="secondary">{page.eyebrow}</Badge>
          <CardTitle className="text-3xl">{page.title}</CardTitle>
          <p className="muted">{page.description}</p>
        </CardHeader>
        <CardContent className="form-grid">
          <ul className="grid gap-2">
            {page.bullets.map((bullet) => (
              <li key={bullet} className="muted">
                • {bullet}
              </li>
            ))}
          </ul>
          <div className="hero-actions">
            {slug === 'contact' ? (
              <Button asChild>
                <a href="https://wa.me/51967906070" target="_blank" rel="noreferrer">
                  {page.ctaPrimary}
                </a>
              </Button>
            ) : (
              <Button asChild>
                <Link href={slug === 'help' ? '/#faq' : slug === 'appointment-system' ? '/#pricing' : '/signup'}>
                  {page.ctaPrimary}
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/">{page.ctaSecondary}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
