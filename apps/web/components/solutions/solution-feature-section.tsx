import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type SolutionFeatureSectionProps = {
  label: string;
  title: string;
  description: string;
  imagePosition: 'left' | 'right';
  visualCaption: string;
  imageSrc: string;
  imageAlt: string;
  imageClassName?: string;
  badge?: {
    label: string;
    tone: 'amber' | 'violet';
  };
  tone?: 'violet' | 'emerald' | 'sky' | 'amber';
  bullets?: string[];
};

const toneStyles = {
  violet: {
    orb: 'bg-violet-100',
    chip: 'bg-violet-50 text-violet-700',
  },
  emerald: {
    orb: 'bg-emerald-100',
    chip: 'bg-emerald-50 text-emerald-700',
  },
  sky: {
    orb: 'bg-sky-100',
    chip: 'bg-sky-50 text-sky-700',
  },
  amber: {
    orb: 'bg-amber-100',
    chip: 'bg-amber-50 text-amber-700',
  },
} as const;

const badgeToneClasses = {
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
} as const;

export function SolutionFeatureSection({
  label,
  title,
  description,
  imagePosition,
  visualCaption,
  imageSrc,
  imageAlt,
  imageClassName,
  badge,
  tone = 'violet',
  bullets,
}: SolutionFeatureSectionProps) {
  const visual = toneStyles[tone];
  const textOrder = imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1';
  const visualOrder = imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2';

  return (
    <section className="py-2 sm:py-4">
      <div className="grid gap-12 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
        <div className={`space-y-5 ${textOrder}`}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
                {label}
              </p>
              {badge ? (
                <Badge
                  className={badgeToneClasses[badge.tone]}
                >
                  {badge.label}
                </Badge>
              ) : null}
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h2>
            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {description}
            </p>
          </div>

          {bullets ? (
            <div className="grid gap-3">
              {bullets.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <p className="text-sm leading-7 text-slate-700 sm:text-base">{item}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className={`relative mx-auto w-full max-w-[560px] ${visualOrder}`}>
          <div className="group relative overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200/80">
            <div className={`absolute inset-6 rounded-[28px] ${visual.orb}`} />
            <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill={true}
                sizes="(max-width: 1024px) 100vw, 42vw"
                className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${imageClassName ?? 'object-center'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-950/5 to-transparent" />
            </div>

            <div className="absolute bottom-4 left-4 z-[1] sm:bottom-6 sm:left-6">
              <div className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] shadow-sm backdrop-blur-sm ${visual.chip}`}>
                {visualCaption}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
