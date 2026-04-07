import Image from 'next/image';
import Link from 'next/link';
import type { SolutionIndustry } from '@/components/solutions/solutions-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type SolutionHeroProps = {
  industry: SolutionIndustry;
};

const dotClasses = [
  'left-[10%] top-[14%] bg-pink-400',
  'left-[56%] top-[12%] bg-blue-400',
  'right-[8%] top-[28%] bg-yellow-400',
  'left-[18%] bottom-[26%] bg-slate-300',
  'right-[18%] bottom-[12%] bg-pink-300',
  'left-[64%] bottom-[8%] bg-blue-400',
];

export function SolutionHero({ industry }: SolutionHeroProps) {
  return (
    <section className="relative py-4 sm:py-6">
      <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_0.95fr]">
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">
              {industry.heroLabel}
            </p>
            <h1 className="max-w-4xl font-display text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              {industry.heroTitle}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              {industry.heroSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {industry.appliesTo.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="border-slate-200 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm"
              >
                {item}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="px-7">
              <Link href="/signup">Get started for free</Link>
            </Button>
            <Button
              asChild={true}
              size="lg"
              variant="outline"
              className="border-slate-300 bg-transparent px-7 text-slate-900 hover:bg-slate-100"
            >
              <Link href="/dashboard">See a demo</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
          <div className="relative min-h-[460px] sm:min-h-[560px]">
            <div className="absolute bottom-6 right-0 top-[18%] w-[82%] rounded-[36px] bg-violet-100 dark:bg-violet-900/20" />

            {dotClasses.map((className) => (
              <span
                key={className}
                className={`absolute h-3 w-3 rounded-full ${className}`}
                aria-hidden={true}
              />
            ))}

            <div className="group relative ml-auto h-[460px] w-full max-w-[440px] overflow-hidden rounded-[32px] sm:h-[560px] sm:max-w-[520px]">
              <Image
                src={industry.imageSrc}
                alt={industry.imageAlt}
                fill={true}
                priority={true}
                sizes="(max-width: 1024px) 100vw, 42vw"
                className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] ${industry.heroImageClassName ?? 'object-center'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
