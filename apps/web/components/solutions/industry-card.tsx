import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { SolutionIndustry } from '@/components/solutions/solutions-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function IndustryCard({ industry }: { industry: SolutionIndustry }) {
  const Icon = industry.icon;

  return (
    <Card className="h-full rounded-[24px] border-slate-200 bg-white text-slate-950 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-slate-100">
          <div className="absolute left-5 top-5 z-10">
            <Badge
              variant="outline"
              className="border-white/80 bg-white/90 text-slate-700 shadow-sm"
            >
              Industry fit
            </Badge>
          </div>
          <div className="relative aspect-[16/10]">
            <Image
              src={industry.imageSrc}
              alt={industry.imageAlt}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/5 to-transparent" />
          </div>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            <Icon className="h-5 w-5" aria-hidden={true} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {industry.slug}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="font-display text-2xl font-semibold tracking-tight">
            {industry.title}
          </h3>
          <p className="text-sm leading-6 text-slate-600">
            {industry.shortDescription}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
            Revenue impact
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-rose-700">
            {industry.impactStat}
          </p>
        </div>

        <div className="mt-auto">
          <Button asChild variant="ghost" className="px-0 text-slate-950 hover:bg-transparent">
            <Link href={`/solutions/${industry.slug}`}>
              Learn more
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden={true} />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
