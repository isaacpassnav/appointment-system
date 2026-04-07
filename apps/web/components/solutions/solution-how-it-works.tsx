import { solutionHowItWorksSteps } from '@/components/solutions/solutions-data';

export function SolutionHowItWorks() {
  return (
    <section className="rounded-[36px] bg-slate-50 px-6 py-8 sm:px-8 sm:py-10">
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
            How it works
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Go live in four simple steps
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            Set up your business once, share your booking link everywhere,
            and let AppointmentOS keep the calendar moving.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {solutionHowItWorksSteps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                key={step.step}
                className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/80"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <Icon className="h-5 w-5" aria-hidden={true} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
