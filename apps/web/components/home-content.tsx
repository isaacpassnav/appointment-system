'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from '@/components/animated-counter';
import { IntegrationRow } from '@/components/integration-row';
import { PricingCard } from '@/components/pricing-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

type ImpactStat = { value: string; label: string };
type ModuleItem = { label: string; detail: string };
type RoadmapItem = { step: string; title: string; detail: string };
type TestimonialItem = { name: string; role: string; quote: string };
type FaqItem = { value: string; question: string; answer: string };

type ParsedMetric = {
  value: number;
  prefix?: string;
  suffix?: string;
};

function parseMetric(raw: string): ParsedMetric {
  const trimmed = raw.trim();
  const matched = trimmed.match(/^([+-]?)(\d+(?:\.\d+)?)(.*)$/);
  if (!matched) {
    return { value: 0, suffix: trimmed };
  }

  const sign = matched[1];
  const numeric = Number(matched[2]);
  const suffix = matched[3] || undefined;
  const value = sign === '-' ? -numeric : numeric;

  return {
    value,
    prefix: sign === '+' ? '+' : undefined,
    suffix,
  };
}

const businessChartData = [
  { period: 'W1', subscriptions: 18, reseller: 8, payments: 82 },
  { period: 'W2', subscriptions: 22, reseller: 11, payments: 86 },
  { period: 'W3', subscriptions: 27, reseller: 16, payments: 91 },
  { period: 'W4', subscriptions: 34, reseller: 21, payments: 95 },
  { period: 'W5', subscriptions: 38, reseller: 27, payments: 99 },
];

export function HomeContent() {
  const { t, i18n } = useTranslation();
  const [activeHeroWord, setActiveHeroWord] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activePricingTab, setActivePricingTab] = useState<'monthly' | 'yearly'>(
    'monthly',
  );

  const heroWords = t('home.heroWords', { returnObjects: true }) as string[];
  const tags = t('home.tags', { returnObjects: true }) as string[];
  const sectors = t('home.sectors', { returnObjects: true }) as string[];
  const impactStats = t('home.impactStats', {
    returnObjects: true,
  }) as ImpactStat[];
  const modules = t('home.modules', { returnObjects: true }) as ModuleItem[];
  const roadmap = t('home.roadmap', { returnObjects: true }) as RoadmapItem[];
  const testimonials = t('home.testimonials', {
    returnObjects: true,
  }) as TestimonialItem[];
  const faqs = t('home.faqs', { returnObjects: true }) as FaqItem[];
  const pricingFeatures = [
    { text: 'Core scheduling', allTiers: true },
    { text: 'Multi-tenant isolation', allTiers: true },
    { text: 'Email reminders', allTiers: false },
    { text: 'AI assistant context', allTiers: false },
    { text: 'Reseller controls', allTiers: false },
    { text: 'Priority support', allTiers: false },
  ];

  const integrationCopy =
    i18n.resolvedLanguage === 'es'
      ? {
          title: 'Integraciones que conectan todo',
          subtitle:
            'Conecta canales clave como WhatsApp, email, Telegram, pagos y calendario en un solo flujo operativo.',
        }
      : i18n.resolvedLanguage === 'pt'
        ? {
            title: 'Integracoes que conectam tudo',
            subtitle:
              'Conecte canais essenciais como WhatsApp, email, Telegram, pagamentos e calendario em um unico fluxo.',
          }
        : {
            title: 'Integrations that connect everything',
            subtitle:
              'Plug channels like WhatsApp, email, Telegram, payments, and calendar into one operational flow.',
          };

  useEffect(() => {
    if (!heroWords.length) return;
    const timer = window.setInterval(() => {
      setActiveHeroWord((prev) => (prev + 1) % heroWords.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [heroWords]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  const visibleTestimonials = useMemo(() => {
    if (!testimonials.length) return [];
    const items: TestimonialItem[] = [];
    for (let i = 0; i < Math.min(3, testimonials.length); i += 1) {
      const index = (activeTestimonial + i) % testimonials.length;
      items.push(testimonials[index]);
    }
    return items;
  }, [activeTestimonial, testimonials]);

  return (
    <main className="space-y-16 py-10 text-slate-950">
      <section className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hero-combo"
        >
          <CardContent className="hero-combo-content">
            <p className="eyebrow">{t('home.eyebrow')}</p>
            <h1 className="hero-title">
              {t('home.titlePrefix')}{' '}
              <span className="hero-word">{heroWords[activeHeroWord] ?? 'Intelligent'}</span>{' '}
              {t('home.titleSuffix')}
            </h1>
            <p className="hero-sub">{t('home.subtitle')}</p>
            <div className="hero-actions">
              <Button size="lg" asChild>
                <Link href="/signup">{t('home.ctaPrimary')}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild={true}
                className="border-slate-300 text-slate-800 hover:bg-slate-100"
              >
                <Link href="/dashboard">{t('home.ctaSecondary')}</Link>
              </Button>
            </div>
            <div className="hero-tags">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="border-slate-200 bg-white text-slate-700 shadow-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </motion.div>
      </section>

      <section className="container impact-section rounded-3xl p-6 sm:p-8">
        <div className="section-head">
          <h2 className="text-3xl font-bold text-slate-950">{t('home.impactTitle')}</h2>
          <p className="muted">{t('home.impactSubtitle')}</p>
        </div>
        <div className="impact-grid">
          {impactStats.map((stat) => {
            const metric = parseMetric(stat.value);
            return (
              <article key={stat.label} className="kpi">
                <strong className="kpi-value">
                  <AnimatedCounter
                    value={metric.value}
                    prefix={metric.prefix}
                    suffix={metric.suffix}
                    duration={1.8}
                  />
                </strong>
                <span className="kpi-label">{stat.label}</span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container sector-strip rounded-3xl p-5">
        <p className="eyebrow mb-3">{t('home.sectorsTitle')}</p>
        <div className="ticker">
          <div className="ticker-track">
            {[...sectors, ...sectors].map((item, idx) => (
              <span key={`${item}-${idx}`} className="ticker-item">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        id="integrations"
        className="container rounded-3xl border border-slate-200 bg-white/80 p-6 text-slate-950 shadow-sm sm:p-8"
      >
        <div className="section-head">
          <h2 className="text-3xl font-bold text-slate-950">{integrationCopy.title}</h2>
          <p className="muted">{integrationCopy.subtitle}</p>
        </div>
        <IntegrationRow />
      </section>

      <section className="container split-grid">
        <Card className="border-slate-200 bg-white text-slate-950 shadow-sm p-6 md:p-8">
          <div className="section-head">
            <h3 className="text-2xl font-bold">{t('home.modulesTitle')}</h3>
            <p className="muted">{t('home.modulesSubtitle')}</p>
          </div>
          <div className="module-list">
            {modules.map((item) => (
              <article key={item.label} className="module-item">
                <p className="module-title">{item.label}</p>
                <p className="module-detail">{item.detail}</p>
              </article>
            ))}
          </div>
        </Card>

        <Card className="accent-card border-0 p-6 text-slate-950 shadow-sm md:p-8">
          <div className="section-head">
            <h3 className="text-2xl font-bold">{t('home.businessTitle')}</h3>
            <p className="muted">{t('home.businessBody')}</p>
          </div>

          <div className="cta-row">
            <Button asChild>
              <Link href="/signup">{t('home.businessPrimary')}</Link>
            </Button>
            <Button
              variant="outline"
              asChild={true}
              className="border-slate-300 text-slate-800 hover:bg-slate-100"
            >
              <Link href="/dashboard">{t('home.businessSecondary')}</Link>
            </Button>
          </div>

          <div className="business-chart">
            <p className="eyebrow">{t('home.businessChartLabel')}</p>
            <motion.div
              aria-hidden={true}
              className="pointer-events-none absolute inset-x-[-22%] bottom-7 z-0 h-14 rounded-full bg-gradient-to-r from-transparent via-primary/55 to-transparent blur-md"
              animate={{ x: ['-8%', '12%', '-8%'], y: [0, -6, 0] }}
              transition={{ duration: 4.4, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.div
              aria-hidden={true}
              className="pointer-events-none absolute inset-x-[-24%] bottom-[74px] z-0 h-14 rounded-full bg-gradient-to-r from-transparent via-violet-400/45 to-transparent blur-md"
              animate={{ x: ['8%', '-10%', '8%'], y: [0, -4, 0] }}
              transition={{ duration: 4.8, ease: 'easeInOut', repeat: Infinity }}
            />
            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={businessChartData}>
                  <defs>
                    <linearGradient id="subsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.12} />
                    </linearGradient>
                    <linearGradient id="resellerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,118,255,0.2)" />
                  <XAxis dataKey="period" stroke="#d6d0f4" />
                  <YAxis stroke="#d6d0f4" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="subscriptions"
                    stroke="#a855f7"
                    fill="url(#subsGradient)"
                    animationDuration={1200}
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="reseller"
                    stroke="#7c3aed"
                    fill="url(#resellerGradient)"
                    animationDuration={1800}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-metrics">
              <div>
                <strong>
                  <AnimatedCounter value={38} prefix="+" suffix="%" />
                </strong>
                <span>{t('home.businessMetricA')}</span>
              </div>
              <div>
                <strong>
                  <AnimatedCounter value={27} suffix="x" />
                </strong>
                <span>{t('home.businessMetricB')}</span>
              </div>
              <div>
                <strong>
                  <AnimatedCounter value={99} suffix="%" />
                </strong>
                <span>{t('home.businessMetricC')}</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="container">
        <div className="section-head">
          <h2 className="text-3xl font-bold text-slate-950">{t('home.roadmapTitle')}</h2>
          <p className="muted">{t('home.roadmapSubtitle')}</p>
        </div>
        <div className="roadmap-grid">
          {roadmap.map((item) => (
            <article key={item.step} className="roadmap-item">
              <p className="roadmap-step">{item.step}</p>
              <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
              <p className="muted">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="pricing"
        className="container rounded-3xl border border-slate-200 bg-white/80 p-6 text-slate-950 shadow-sm sm:p-8"
      >
        <div className="section-head">
          <h2 className="text-3xl font-bold text-slate-950">{t('nav.pricing')}</h2>
          <p className="muted">
            {i18n.resolvedLanguage === 'es'
              ? 'Escala por etapas con planes claros para negocios y resellers.'
              : i18n.resolvedLanguage === 'pt'
                ? 'Escalone em etapas com planos claros para negocios e resellers.'
                : 'Scale in stages with clear plans for businesses and resellers.'}
          </p>
        </div>
        <div className="pricing-tabs">
          <button
            className={`pricing-tab ${activePricingTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setActivePricingTab('monthly')}
          >
            {i18n.resolvedLanguage === 'es'
              ? 'Mensual'
              : i18n.resolvedLanguage === 'pt'
                ? 'Mensal'
                : 'Monthly'}
          </button>
          <button
            className={`pricing-tab ${activePricingTab === 'yearly' ? 'active' : ''}`}
            onClick={() => setActivePricingTab('yearly')}
          >
            {i18n.resolvedLanguage === 'es'
              ? 'Anual (20% off)'
              : i18n.resolvedLanguage === 'pt'
                ? 'Anual (20% off)'
                : 'Yearly (20% off)'}
          </button>
        </div>
        <div className="pricing-grid">
          <PricingCard
            tier="starter"
            price={activePricingTab === 'monthly' ? '$0/mo' : '$0/yr'}
            features={pricingFeatures}
            ctaText={
              i18n.resolvedLanguage === 'es'
                ? 'Empezar'
                : i18n.resolvedLanguage === 'pt'
                  ? 'Comecar'
                  : 'Start'
            }
          />
          <PricingCard
            tier="pro"
            price={activePricingTab === 'monthly' ? '$29/mo' : '$278/yr'}
            features={pricingFeatures}
            popular={true}
            ctaText={
              i18n.resolvedLanguage === 'es'
                ? 'Mas elegido'
                : i18n.resolvedLanguage === 'pt'
                  ? 'Mais escolhido'
                  : 'Most chosen'
            }
          />
          <PricingCard
            tier="business"
            price={activePricingTab === 'monthly' ? '$99/mo' : '$948/yr'}
            features={pricingFeatures}
            ctaText={i18n.resolvedLanguage === 'en' ? 'Scale' : 'Escalar'}
          />
          <PricingCard
            tier="enterprise"
            price="Custom"
            features={pricingFeatures}
            ctaText={
              i18n.resolvedLanguage === 'es'
                ? 'Contactar'
                : i18n.resolvedLanguage === 'pt'
                  ? 'Contato'
                  : 'Contact'
            }
          />
        </div>
      </section>

      <section className="container testimonial-section rounded-3xl p-6 sm:p-8">
        <div className="section-head">
          <h2 className="text-3xl font-bold text-slate-950">{t('home.testimonialsTitle')}</h2>
          <p className="muted">{t('home.testimonialsSubtitle')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleTestimonials.map((item) => (
            <article key={`${item.name}-${item.role}`} className="testimonial-card">
              <div className="avatar">
                <span>{item.name.slice(0, 2).toUpperCase()}</span>
              </div>
              <p className="stars">5/5 rating</p>
              <p className="quote">{item.quote}</p>
              <div className="author">
                <strong className="text-slate-950">{item.name}</strong>
                <span className="muted">{item.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="faq"
        className="container rounded-3xl border border-slate-200 bg-white/80 p-6 text-slate-950 shadow-sm sm:p-8"
      >
        <div className="section-head">
          <h2 className="text-3xl font-bold text-slate-950">{t('home.faqTitle')}</h2>
          <p className="muted">{t('home.faqSubtitle')}</p>
        </div>
        <Accordion type="single" collapsible className="grid gap-3">
          {faqs.map((faq) => (
            <AccordionItem key={faq.value} value={faq.value}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="container py-8">
        <Card className="hero-combo border-0">
          <CardContent className="hero-combo-content">
            <h2 className="hero-title">{t('home.businessTitle')}</h2>
            <p className="hero-sub">{t('home.businessBody')}</p>
            <div className="hero-actions">
              <Button asChild size="lg">
                <Link href="/signup">{t('home.ctaPrimary')}</Link>
              </Button>
              <Button
                asChild={true}
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-800 hover:bg-slate-100"
              >
                <Link href="/login">{t('nav.login')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
