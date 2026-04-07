import Image from 'next/image';
import { solutionIntegrations } from '@/components/solutions/solutions-data';

export function SolutionIntegrationsGrid() {
  return (
    <section className="py-2 sm:py-4">
      <div className="space-y-5">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
            Integrations
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Connect the tools you already use.
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            AppointmentOS plugs into your existing workflow. One setup,
            everything connected.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {solutionIntegrations.map((integration) => {
            const FallbackIcon = integration.icon;

            return (
              <article
                key={integration.label}
                className="flex min-h-[188px] flex-col items-center justify-center rounded-[28px] bg-white px-6 py-7 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50">
                  {integration.assetSrc ? (
                    <Image
                      src={integration.assetSrc}
                      alt={`${integration.label} logo`}
                      width={80}
                      height={80}
                      className="h-16 w-16 object-contain"
                    />
                  ) : FallbackIcon ? (
                    <FallbackIcon className="h-10 w-10 text-slate-900" aria-hidden={true} />
                  ) : (
                    <span className="text-sm font-semibold text-slate-700">
                      {integration.label}
                    </span>
                  )}
                </div>
                <p className="mt-5 text-base font-semibold text-slate-900">
                  {integration.label}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
