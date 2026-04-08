import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { ComparisonTable } from '@/components/solutions/comparison-table';
import { IndustryCard } from '@/components/solutions/industry-card';
import { NoShowCalculator } from '@/components/solutions/no-show-calculator';
import { ProsConsSection } from '@/components/solutions/pros-cons-section';
import {
  appointmentIoPros,
  comparisonFeatures,
  individualsSolution,
  noShowLosses,
  sharedSolutionCta,
  solutionsIndustries,
  withoutAppointmentIoCons,
} from '@/components/solutions/solutions-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SolutionsPage() {
  const SharedIcon = sharedSolutionCta.icon;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 py-10">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-white via-slate-50 to-violet-50 text-slate-950">
        <div className="grid gap-12 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                The right solution for your business
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Whether you run a clinic, barbershop, spa or studio -
                AppointmentIO adapts to how you work.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={sharedSolutionCta.primaryHref}>
                  {sharedSolutionCta.primaryLabel}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={sharedSolutionCta.secondaryHref}>
                  {sharedSolutionCta.secondaryLabel}
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative isolate flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[520px] overflow-hidden">
              <div className="relative min-h-[420px] overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-100/90 via-white to-sky-50">
                <div className="absolute bottom-0 right-0 h-[48%] w-[82%] rounded-tl-[36px] bg-violet-200/80" />
                <span className="absolute left-[14%] top-[16%] h-3 w-3 rounded-full bg-sky-400" />
                <span className="absolute left-[58%] top-[12%] h-3 w-3 rounded-full bg-fuchsia-300" />
                <span className="absolute left-[80%] top-[28%] h-3 w-3 rounded-full bg-amber-300" />
                <span className="absolute left-[24%] top-[66%] h-3 w-3 rounded-full bg-violet-300" />
                <span className="absolute left-[78%] top-[80%] h-3 w-3 rounded-full bg-rose-300" />
                <div className="relative ml-auto h-[420px] w-full max-w-[360px]">
                  <Image
                    src="/solutions/solutions-overview.jpg"
                    alt="Professional consultant portrait representing AppointmentIO solutions for service businesses."
                    fill={true}
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-contain object-bottom"
                    priority={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Fit
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">6 industries</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Purpose-built arguments and buying logic for each vertical.
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Outcome
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            Up to 80%
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Reduction in no-show impact through reminders and better workflows.
          </p>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-slate-50 px-6 py-10 text-slate-950 shadow-sm sm:px-10">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Industry solutions
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Choose the best operating model for your business type
          </h2>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            Each industry has a different buying trigger. AppointmentIO is positioned to
            solve the operational pain that makes clients act now.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {solutionsIndustries.map((industry) => (
            <IndustryCard key={industry.slug} industry={industry} />
          ))}
        </div>
      </section>

      <section
        id="individuals"
        className="rounded-[32px] border border-slate-200 bg-slate-50 px-6 py-10 text-slate-950 shadow-sm sm:px-10"
      >
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[28px] p-6">
            <div className="relative min-h-[320px] overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-100 via-white to-emerald-50">
              <span className="absolute left-[12%] top-[14%] h-3 w-3 rounded-full bg-violet-300" />
              <span className="absolute left-[74%] top-[12%] h-3 w-3 rounded-full bg-sky-300" />
              <span className="absolute left-[76%] top-[72%] h-3 w-3 rounded-full bg-amber-300" />
              <div className="absolute bottom-0 right-0 h-[42%] w-[72%] rounded-tl-[28px] bg-violet-100" />
              <div className="absolute left-5 top-5 z-10 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                Solo operator
              </div>
              <div className="relative ml-auto h-[320px] w-full max-w-[280px]">
                <Image
                  src="/solutions/coaches-hero.jpg"
                  alt="Solo coach using AppointmentIO to look professional and stay organized."
                  fill={true}
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                For individuals
              </p>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {individualsSolution.title}
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                {individualsSolution.body}
              </p>
            </div>
            <div className="grid gap-3">
              {individualsSolution.bullets.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <BadgeCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
            <Button asChild size="lg">
              <Link href={individualsSolution.ctaHref}>
                {individualsSolution.ctaLabel}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-slate-50 px-6 py-10 text-slate-950 shadow-sm sm:px-10">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Revenue loss
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            What no-shows are really costing you
          </h2>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            The problem is not just empty time. It is wasted acquisition cost, lower
            utilization, and less predictable revenue across the month.
          </p>
        </div>
        <NoShowCalculator items={noShowLosses} />
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-slate-50 px-6 py-10 text-slate-950 shadow-sm sm:px-10">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Comparison
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Why AppointmentIO over the rest
          </h2>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            AppointmentIO is built for businesses that need multilingual growth,
            operational automation, and a reseller model from the start.
          </p>
        </div>
        <ComparisonTable features={comparisonFeatures} />
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-slate-50 px-6 py-10 text-slate-950 shadow-sm sm:px-10">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Decision support
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            The difference between operational control and constant churn
          </h2>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            This is the practical business case. Buying software is not about
            aesthetics - it is about protecting revenue and reducing operational drag.
          </p>
        </div>
        <ProsConsSection
          pros={appointmentIoPros}
          cons={withoutAppointmentIoCons}
        />
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-slate-50 px-6 py-10 text-slate-950 shadow-sm sm:px-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Badge
            variant="outline"
            className="border-slate-300 bg-white text-slate-700"
          >
            Final CTA
          </Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to stop losing appointments?
          </h2>
          <p className="text-base leading-7 text-slate-600">
            Launch with a system that improves show-rate, keeps communication under
            control, and gives you room to scale from one operator to many tenants.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={sharedSolutionCta.primaryHref}>
                {sharedSolutionCta.primaryLabel}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={sharedSolutionCta.secondaryHref}>
                {sharedSolutionCta.secondaryLabel}
                <SharedIcon className="ml-2 h-4 w-4" aria-hidden={true} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
