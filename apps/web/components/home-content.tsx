"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { FaCalendarCheck, FaRobot, FaDog, FaCheck } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeaturesCard } from "@/components/features-card";
import { IntegrationRow } from "@/components/integration-row";
import { PricingCard } from "@/components/pricing-card";
import { AnimatedCounter } from "@/components/animated-counter";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";

export function HomeContent() {
  const { t } = useTranslation();
  const [activePricingTab, setActivePricingTab] = useState<
    "monthly" | "yearly"
  >("monthly");
  const [activeHeroWord, setActiveHeroWord] = useState(0);
  const heroWords = ["Intelligent", "Automated", "Scalable", "Effortless"];

  const features = [
    {
      icon: "text-blue-400",
      title: "Smart Appointment Scheduling",
      description:
        "Conflict-free booking with real-time availability. Embeddable calendar reduces no-shows.",
      points: [
        "24/7 availability checker",
        "Team scheduling",
        "ICS/Google Calendar export",
      ],
    },
    {
      icon: "text-green-400",
      title: "Automated Reminders",
      description:
        "Send email/SMS reminders 24h before appointments. Reduce no-shows by 40%.",
      points: [
        "Customizable templates",
        "Multi-channel delivery",
        "Analytics tracking",
      ],
    },
    {
      icon: "text-purple-400",
      title: "AI Customer Support",
      description:
        "Intelligent chatbots handle inquiries, booking assistance, and follow-ups.",
      points: [
        "24/7 AI responses",
        "Escalation to human",
        "Conversation analytics",
      ],
    },
    {
      icon: "text-orange-400",
      title: "Business Automation",
      description:
        "Automate sales pipelines, lead nurturing, and customer workflows.",
      points: ["Sales automation flows", "Lead scoring", "CRM integrations"],
    },
    {
      icon: "text-teal-400",
      title: "Website Builder",
      description:
        "Embeddable booking pages with your branding. No coding required.",
      points: ["Custom domains", "Payment integration", "Conversion analytics"],
    },
    {
      icon: "text-indigo-400",
      title: "Workflow Automation",
      description:
        "Custom workflows for any business process. Connect everything.",
      points: ["No-code builder", "100+ triggers/actions", "Advanced logic"],
    },
  ];

  const pricingFeatures = [
    { text: "Core scheduling", allTiers: true },
    { text: "Email reminders", allTiers: false },
    { text: "Basic analytics", allTiers: false },
    { text: "Team management", allTiers: false },
    { text: "AI chatbots", allTiers: false },
    { text: "Unlimited workflows", allTiers: false },
    { text: "Priority support", allTiers: false },
    { text: "Custom integrations", allTiers: false },
  ];

  const heroRef = useInView({ threshold: 0.3 }).ref;
  const featuresRef = useInView({ threshold: 0.2 }).ref;
  const demoRef = useInView({ threshold: 0.2 }).ref;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroWord((prev) => (prev + 1) % heroWords.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroWords.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <main className="space-y-24 py-12">
      {/* Hero */}
      <section id="product" ref={heroRef} className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div variants={itemVariants}>
            <p className="eyebrow mb-6">The Modern Scheduling Platform</p>
            <h1 className="hero-title mb-6">
              AppointmentOS — AI-Powered{" "}
              <span className="hero-word" key={activeHeroWord}>
                {heroWords[activeHeroWord]}
              </span>{" "}
              Scheduling & Business Automation
            </h1>
            <p className="hero-sub max-w-2xl mx-auto mb-8">
              Schedule appointments, automate workflows, scale business. Reduce
              no-shows 40% smart reminders + AI support. Integrates entire
              stack.
            </p>
            <div className="hero-actions mb-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="px-8 font-bold shadow-lg">
                <Link href="/signup">Start Free</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard">Book Demo</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge variant="secondary">24/7 Support</Badge>
              <Badge variant="secondary">SOC 2 Compliant</Badge>
              <Badge variant="secondary">99.99% Uptime</Badge>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="logos-section container py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="logos-grid"
        >
          <div className="logo-item">Stripe</div>
          <div className="logo-item">Notion</div>
          <div className="logo-item">Linear</div>
          <div className="logo-item">Vercel</div>
          <div className="logo-item">HubSpot</div>
          <div className="logo-item">Shopify</div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" ref={featuresRef} className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2 variants={itemVariants} className="hero-title mb-6">
            Everything You Need
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="hero-sub max-w-2xl mx-auto"
          >
            Powerful features for modern business.
          </motion.p>
        </motion.div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeaturesCard
              key={feature.title}
              feature={feature}
              index={index}
              className="h-full"
            />
          ))}
        </div>
      </section>

      {/* Product Demo */}
      <section ref={demoRef} className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="demo-mock lg:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={itemVariants}>
            <div className="mb-8">
              <span className="eyebrow">Live Demo</span>
              <h2 className="text-4xl font-bold mt-4 mb-6">Dashboard Awaits</h2>
              <p className="hero-sub mb-12">
                Monitor bookings, revenue, workflows. Beautiful interface.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="kpi text-center p-8 rounded-2xl bg-muted/50 border shadow-lg">
                <div className="text-4xl font-bold text-primary mb-3">
                  <AnimatedCounter value={124} />
                </div>
                <div>Bookings Today</div>
              </div>
              <div className="kpi text-center p-8 rounded-2xl bg-muted/50 border shadow-lg">
                <div className="text-4xl font-bold text-green-400 mb-3">
                  <AnimatedCounter value={98} />%
                </div>
                <div>Show Rate</div>
              </div>
            </div>
          </motion.div>
          <motion.div className="order-first lg:order-last">
            <div className="demo-frame p-8 max-w-lg mx-auto">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-muted/30 text-center border">
                    <div className="text-2xl font-bold mb-1">47</div>
                    <div className="text-xs uppercase text-muted-foreground">
                      New Leads
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-muted/30 text-center border">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      $2.8k
                    </div>
                    <div className="text-xs uppercase text-muted-foreground">
                      Revenue
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-muted/30 text-center border">
                    <div className="text-2xl font-bold text-orange-400 mb-1">
                      92%
                    </div>
                    <div className="text-xs uppercase text-muted-foreground">
                      Utilization
                    </div>
                  </div>
                </div>
                <div className="h-64 bg-gradient-to-r from-muted/20 via-primary/10 to-accent/10 rounded-2xl flex items-center justify-center border-2 border-muted shadow-inner">
                  <span>📊 Interactive Charts</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Integrations */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="hero-title mb-6">Works with Everything</h2>
            <p className="hero-sub max-w-2xl mx-auto">
              Connect tools in minutes.
            </p>
          </motion.div>
          <div className="integrations-wrapper p-12 rounded-3xl max-w-6xl mx-auto">
            <IntegrationRow />
          </div>
        </div>
      </section>

      {/* Automation */}
      <section className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="hero-title mb-6">Automate Business</h2>
          <p className="hero-sub max-w-3xl mx-auto">
            Beyond scheduling - powerful automations 24/7.
          </p>
        </motion.div>
        <div className="automation-grid">
          <motion.div
            variants={itemVariants}
            className="automation-card text-center"
          >
            <FaCalendarCheck className="h-20 w-20 text-primary mx-auto mb-8" />
            <h3 className="text-3xl font-bold mb-6">Customer Support</h3>
            <p className="text-xl text-muted-foreground mb-8">
              Auto-respond, book, follow-up.
            </p>
            <ul className="space-y-3 text-lg">
              <li>
                <FaCheck className="inline text-green-400 mr-3 h-5 w-5" />
                24/7 booking
              </li>
              <li>
                <FaCheck className="inline text-green-400 mr-3 h-5 w-5" />
                Smart escalation
              </li>
              <li>
                <FaCheck className="inline text-green-400 mr-3 h-5 w-5" />
                Satisfaction surveys
              </li>
            </ul>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="automation-card text-center"
          >
            <FaDog className="h-20 w-20 text-primary mx-auto mb-8" />
            <h3 className="text-3xl font-bold mb-6">Sales Pipelines</h3>
            <p className="text-xl text-muted-foreground mb-8">
              Nurture leads, close deals autopilot.
            </p>
            <ul className="space-y-3 text-lg">
              <li>
                <FaCheck className="inline text-green-400 mr-3 h-5 w-5" />
                Lead qualification
              </li>
              <li>
                <FaCheck className="inline text-green-400 mr-3 h-5 w-5" />
                Meeting scheduler
              </li>
              <li>
                <FaCheck className="inline text-green-400 mr-3 h-5 w-5" />
                Contract workflows
              </li>
            </ul>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="automation-card text-center"
          >
            <FaRobot className="h-20 w-20 text-primary mx-auto mb-8" />
            <h3 className="text-3xl font-bold mb-6">Lead Follow-ups</h3>
            <p className="text-xl text-muted-foreground mb-8">
              Multi-touch sequences convert prospects.
            </p>
            <ul className="space-y-3 text-lg">
              <li>
                <FaCheck className="inline text-green-400 mr-3 h-5 w-5" />
                Multi-touch campaigns
              </li>
              <li>
                <FaCheck className="inline text-green-400 mr-3 h-5 w-5" />
                Behavior triggers
              </li>
              <li>
                <FaCheck className="inline text-green-400 mr-3 h-5 w-5" />
                Win/loss analysis
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="py-24 bg-gradient-to-b from-muted/30 to-surface"
      >
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="hero-title mb-8">Simple Pricing</h2>
            <p className="hero-sub max-w-2xl mx-auto mb-12">
              Start free. Scale limits. No hidden fees.
            </p>
            <div className="pricing-tabs mb-16">
              <button
                className={cn(
                  "pricing-tab px-8 py-3",
                  activePricingTab === "monthly" && "pricing-tab.active",
                )}
                onClick={() => setActivePricingTab("monthly")}
              >
                Monthly
              </button>
              <button
                className={cn(
                  "pricing-tab px-8 py-3",
                  activePricingTab === "yearly" && "pricing-tab.active",
                )}
                onClick={() => setActivePricingTab("yearly")}
              >
                Yearly (20% off)
              </button>
            </div>
          </motion.div>
          <div className="pricing-grid">
            <PricingCard
              tier="starter"
              price={activePricingTab === "monthly" ? "$0/mo" : "$0/yr"}
              features={pricingFeatures}
            />
            <PricingCard
              tier="pro"
              price={activePricingTab === "monthly" ? "$29/mo" : "$278/yr"}
              features={pricingFeatures}
              popular
              ctaText="Popular"
            />
            <PricingCard
              tier="business"
              price={activePricingTab === "monthly" ? "$99/mo" : "$948/yr"}
              features={pricingFeatures}
            />
            <PricingCard
              tier="enterprise"
              price="Custom"
              features={pricingFeatures}
              ctaText="Contact"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32">
        <Card className="hero-combo max-w-4xl mx-auto text-center border-0 shadow-2xl">
          <CardContent className="p-20">
            <motion.h2
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="hero-title mb-8"
            >
              Ready Transform Business?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="hero-sub mb-12 max-w-2xl mx-auto"
            >
              Join 5k+ businesses using AppointmentOS schedule smarter grow
              faster.
            </motion.p>
            <div className="flex flex-col lg:flex-row gap-6 justify-center">
              <Button
                size="lg"
                asChild
                className="px-16 py-8 text-lg font-bold shadow-2xl"
              >
                <Link href="/signup">Start Free</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="px-16 py-8 text-lg font-bold"
              >
                <Link href="/dashboard">Live Demo</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
