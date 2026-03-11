'use client';

import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedCounter } from '@/components/animated-counter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';

type Pillar = { title: string; description: string };
type Stat = { value: string; label: string };
type ModuleItem = { label: string; detail: string };
type RoadmapItem = { step: string; title: string; detail: string };
type Testimonial = { name: string; role: string; quote: string };
type Faq = { value: string; question: string; answer: string };
type ImpactStat = Stat & { num: number; suffix: string; prefix: string };
type BusinessMetric = { label: string; value: number; prefix: string; suffix: string };

export function HomeContent() {
  const { t } = useTranslation();
  const tags = t('home.tags', { returnObjects: true }) as string[];
  const impactStatsRaw = t('home.impactStats', { returnObjects: true }) as Stat[];
  const sectors = t('home.sectors', { returnObjects: true }) as string[];
  const pillars = t('home.pillars', { returnObjects: true }) as Pillar[];
  const modules = t('home.modules', { returnObjects: true }) as ModuleItem[];
  const roadmap = t('home.roadmap', { returnObjects: true }) as RoadmapItem[];
  const testimonials = t('home.testimonials', { returnObjects: true }) as Testimonial[];
  const faqs = t('home.faqs', { returnObjects: true }) as Faq[];
  const heroWords = t('home.heroWords', { returnObjects: true }) as string[];
  const titlePrefix = t('home.titlePrefix');
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const testimonialCount = testimonials.length;
  const maxTestimonialIndex = Math.max(0, testimonialCount - slidesPerView);

  const currentTestimonialIndex = Math.min(activeTestimonial, maxTestimonialIndex);
  const visibleTestimonials = useMemo(() => {
    if (testimonialCount === 0) return [];
    const start = currentTestimonialIndex;
    const end = start + slidesPerView;
    return testimonials.slice(start, end);
  }, [currentTestimonialIndex, slidesPerView, testimonialCount, testimonials]);

  const currentHeroWord = heroWords[activeWordIndex % heroWords.length] ?? '';

  const impactStats: ImpactStat[] = impactStatsRaw.map((stat) => {
    const match = stat.value.match(/^([^0-9]*)([0-9]+)(.*)$/) ?? ['', '', '0', ''];
    return {
      ...stat,
      prefix: match[1] ?? '',
      num: Number(match[2] ?? 0),
      suffix: match[3] ?? '',
    };
  });

  const businessMetrics: BusinessMetric[] = [
    { label: t('home.businessMetricA'), value: 38, prefix: '+', suffix: '%' },
    { label: t('home.businessMetricB'), value: 27, prefix: '', suffix: 'x' },
    { label: t('home.businessMetricC'), value: 99, prefix: '', suffix: '%' },
  ];
  const chartData = [
    { name: 'M1', value: 22 },
    { name: 'M2', value: 32 },
    { name: 'M3', value: 28 },
    { name: 'M4', value: 45 },
    { name: 'M5', value: 52 },
    { name: 'M6', value: 60 },
  ];
  const { ref: chartRef, inView: chartInView } = useInView({
    triggerOnce: true,
    threshold: 0.35,
  });

  useEffect(() => {
    if (testimonialCount <= slidesPerView) return;
    const timer = window.setInterval(() => {
      setActiveTestimonial((value) => (value + 1) % (maxTestimonialIndex + 1));
    }, 5200);
    return () => window.clearInterval(timer);
  }, [maxTestimonialIndex, slidesPerView, testimonialCount]);

  useEffect(() => {
    if (heroWords.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveWordIndex((value) => (value + 1) % heroWords.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [heroWords.length]);

  useEffect(() => {
    const resolveSlides = () => {
      if (window.innerWidth >= 1100) return 3;
      if (window.innerWidth >= 720) return 2;
      return 1;
    };
    const updateSlides = () => setSlidesPerView(resolveSlides());
    updateSlides();
    window.addEventListener('resize', updateSlides);
    return () => window.removeEventListener('resize', updateSlides);
  }, []);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');


  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="stack">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
      >
        <Card className="hero-combo hero-center">
          <CardContent className="hero-combo-content">
            <p className="eyebrow">{t('home.eyebrow')}</p>
            <h1 className="hero-title">
              {titlePrefix ? `${titlePrefix} ` : ''}
              <span key={currentHeroWord} className="hero-word">
                {currentHeroWord}
              </span>{' '}
              {t('home.titleSuffix')}
            </h1>
            <p className="hero-sub">{t('home.subtitle')}</p>
            <div className="hero-actions">
              <Button asChild>
                <Link href="/signup">{t('home.ctaPrimary')}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">{t('home.ctaSecondary')}</Link>
              </Button>
            </div>
            <div className="hero-tags">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Card className="impact-section">
          <CardHeader>
            <CardTitle>{t('home.impactTitle')}</CardTitle>
            <p className="muted">{t('home.impactSubtitle')}</p>
          </CardHeader>
          <CardContent className="impact-grid">
            {impactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="kpi"
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: index * 0.08 }}
              >
                <span className="kpi-value">
                  <AnimatedCounter value={stat.num} prefix={stat.prefix} suffix={stat.suffix} />
                </span>
                <span className="kpi-label">{stat.label}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Card className="sector-strip">
          <CardContent>
            <p className="eyebrow">{t('home.sectorsTitle')}</p>
            <div className="ticker">
              <div className="ticker-track">
                {[...sectors, ...sectors].map((item, index) => (
                  <span key={`${item}-${index}`} className="ticker-item">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="feature-grid">
        {pillars.map((item, index) => (
          <motion.div
            key={item.title}
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="muted">{item.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="split-grid">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('home.modulesTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="muted">{t('home.modulesSubtitle')}</p>
              <div className="module-list">
                {modules.map((item) => (
                  <div key={item.label} className="module-item">
                    <span className="module-title">{item.label}</span>
                    <span className="module-detail">{item.detail}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <Card className="accent-card">
            <CardHeader>
              <CardTitle>{t('home.businessTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="muted">{t('home.businessBody')}</p>
              <div className="cta-row">
                <Button asChild>
                  <Link href="/signup">{t('home.businessPrimary')}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">{t('home.businessSecondary')}</Link>
                </Button>
              </div>
              <div
                ref={chartRef}
                className="business-chart"
                role="img"
                aria-label={t('home.businessChartLabel')}
              >
                {chartInView && (
                  <div className="chart-area">
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#b388ff" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#3b1a7a" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fill: '#a39ccf', fontSize: 11 }} axisLine={false} />
                        <YAxis hide />
                        <Tooltip
                          cursor={{ stroke: '#9f7aea', strokeDasharray: '4 4' }}
                          contentStyle={{
                            background: 'rgba(10, 10, 25, 0.9)',
                            border: '1px solid rgba(148, 118, 255, 0.3)',
                            borderRadius: 12,
                            color: '#fff',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#b388ff"
                          strokeWidth={2}
                          fill="url(#metricGradient)"
                          isAnimationActive={chartInView}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="chart-metrics">
                  {businessMetrics.map((metric) => (
                    <div key={metric.label}>
                      <strong>
                        <AnimatedCounter
                          value={metric.value}
                          prefix={metric.prefix}
                          suffix={metric.suffix}
                        />
                      </strong>
                      <span>{metric.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('home.roadmapTitle')}</CardTitle>
            <p className="muted">{t('home.roadmapSubtitle')}</p>
          </CardHeader>
          <CardContent className="roadmap-grid">
            {roadmap.map((item) => (
              <div key={item.step} className="roadmap-item">
                <span className="roadmap-step">{item.step}</span>
                <h3>{item.title}</h3>
                <p className="muted">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        <Card className="testimonial-section">
          <CardHeader>
            <CardTitle>{t('home.testimonialsTitle')}</CardTitle>
            <p className="muted">{t('home.testimonialsSubtitle')}</p>
          </CardHeader>
          <CardContent>
            {visibleTestimonials.length > 0 && (
              <div className="testimonial-carousel" style={{ ['--slides-per-view' as string]: slidesPerView }}>
                <div className="testimonial-track" style={{ ['--slide-index' as string]: currentTestimonialIndex }}>
                  {testimonials.map((item, index) => (
                    <article key={`${item.name}-${index}`} className="testimonial-card testimonial-slide">
                      <div className="avatar" aria-hidden={true}>
                        <span>{getInitials(item.name)}</span>
                      </div>
                      <div className="stars">*****</div>
                      <p className="quote">{item.quote}</p>
                      <div className="author">
                        <strong>{item.name}</strong>
                        <span className="muted">{item.role}</span>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="testimonial-dots" role="tablist" aria-label="Testimonials">
                  {Array.from({ length: maxTestimonialIndex + 1 }, (_, index) => (
                    <button
                      key={`dot-${index}`}
                      type="button"
                      className={`dot ${index === currentTestimonialIndex ? 'active' : ''}`}
                      aria-label={`Go to testimonial set ${index + 1}`}
                      aria-pressed={index === currentTestimonialIndex}
                      onClick={() => setActiveTestimonial(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('home.faqTitle')}</CardTitle>
            <p className="muted">{t('home.faqSubtitle')}</p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="grid gap-3">
              {faqs.map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
