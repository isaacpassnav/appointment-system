import { AnimatedCounter } from '@/components/animated-counter';
import { solutionWorkflowMetrics } from '@/components/solutions/solutions-data';

function parseMetric(value: string) {
  const matched = value.match(/^([+-]?)(\d+(?:\.\d+)?)(.*)$/);

  if (!matched) {
    return {
      numeric: 0,
      prefix: undefined,
      suffix: value,
    };
  }

  const sign = matched[1];
  const numeric = Number(matched[2]) * (sign === '-' ? -1 : 1);

  return {
    numeric,
    prefix: sign === '+' ? '+' : undefined,
    suffix: matched[3] || undefined,
  };
}

export function SolutionWorkflowImpact() {
  return (
    <section className="rounded-[36px] bg-slate-50 px-6 py-8 sm:px-8 sm:py-10">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
            Workflow impact
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Cleaner operations from booking to visit
          </h2>
          <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            This rollout gives your team predictable days, fewer manual follow-ups,
            and clearer appointment ownership without adding admin overhead.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {solutionWorkflowMetrics.map((metric) => {
            const Icon = metric.icon;
            const parsed = parseMetric(metric.value);

            return (
              <article
                key={metric.label}
                className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/80 transition-transform duration-300 hover:-translate-y-1"
              >
                <Icon className="h-5 w-5 text-violet-500" aria-hidden={true} />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-2 font-display text-3xl font-semibold text-slate-950">
                  <AnimatedCounter
                    value={parsed.numeric}
                    prefix={parsed.prefix}
                    suffix={parsed.suffix}
                    duration={1.8}
                  />
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{metric.detail}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
