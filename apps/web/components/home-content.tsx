'use client';

import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/providers/locale-provider';

export function HomeContent() {
  const { t } = useI18n();

  return (
    <section className="stack">
      <Card className="hero-combo" data-aos="fade-up">
        <CardContent className="hero-combo-content">
          <div className="hero-copy">
            <p className="eyebrow">{t.home.eyebrow}</p>
            <h1 className="hero-title">{t.home.title}</h1>
            <p className="hero-sub">{t.home.subtitle}</p>
            <div className="hero-actions">
              <Button asChild>
                <Link href="/signup">{t.home.ctaPrimary}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">{t.home.ctaSecondary}</Link>
              </Button>
            </div>
            <div className="hero-tags">
              {t.home.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="impact-section" data-aos="fade-up">
        <CardHeader>
          <CardTitle>{t.home.impactTitle}</CardTitle>
          <p className="muted">{t.home.impactSubtitle}</p>
        </CardHeader>
        <CardContent className="impact-grid">
          {t.home.impactStats.map((stat) => (
            <div key={stat.label} className="kpi">
              <span className="kpi-value">{stat.value}</span>
              <span className="kpi-label">{stat.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="sector-strip" data-aos="fade-up">
        <CardContent>
          <p className="eyebrow">{t.home.sectorsTitle}</p>
          <div className="ticker">
            <div className="ticker-track">
              {[...t.home.sectors, ...t.home.sectors].map((item, index) => (
                <span key={`${item}-${index}`} className="ticker-item">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="feature-grid">
        {t.home.pillars.map((item, index) => (
          <Card key={item.title} data-aos="fade-up" data-aos-delay={index * 80}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="muted">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="split-grid">
        <Card data-aos="fade-up">
          <CardHeader>
            <CardTitle>{t.home.modulesTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="muted">{t.home.modulesSubtitle}</p>
            <div className="module-list">
              {t.home.modules.map((item) => (
                <div key={item.label} className="module-item">
                  <span className="module-title">{item.label}</span>
                  <span className="module-detail">{item.detail}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="accent-card" data-aos="fade-left">
          <CardHeader>
            <CardTitle>{t.home.businessTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="muted">{t.home.businessBody}</p>
            <div className="cta-row">
              <Button asChild>
                <Link href="/signup">{t.home.businessPrimary}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">{t.home.businessSecondary}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-aos="fade-up">
        <CardHeader>
          <CardTitle>{t.home.roadmapTitle}</CardTitle>
          <p className="muted">{t.home.roadmapSubtitle}</p>
        </CardHeader>
        <CardContent className="roadmap-grid">
          {t.home.roadmap.map((item) => (
            <div key={item.step} className="roadmap-item">
              <span className="roadmap-step">{item.step}</span>
              <h3>{item.title}</h3>
              <p className="muted">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="testimonial-section" data-aos="fade-up">
        <CardHeader>
          <CardTitle>{t.home.testimonialsTitle}</CardTitle>
          <p className="muted">{t.home.testimonialsSubtitle}</p>
        </CardHeader>
        <CardContent className="testimonial-grid">
          {t.home.testimonials.map((item, index) => (
            <article key={item.name} className="testimonial-card" data-aos="zoom-in" data-aos-delay={index * 80}>
              <div className="stars">*****</div>
              <p className="quote">"{item.quote}"</p>
              <div className="author">
                <strong>{item.name}</strong>
                <span className="muted">{item.role}</span>
              </div>
            </article>
          ))}
        </CardContent>
      </Card>

      <Card data-aos="fade-up">
        <CardHeader>
          <CardTitle>{t.home.faqTitle}</CardTitle>
          <p className="muted">{t.home.faqSubtitle}</p>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="grid gap-3">
            {t.home.faqs.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
}
