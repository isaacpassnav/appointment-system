import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ProsConsSection({
  pros,
  cons,
}: {
  pros: string[];
  cons: string[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="rounded-[28px] border-emerald-200 bg-emerald-50 text-slate-950 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-5 w-5" aria-hidden={true} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                With AppointmentIO
              </p>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                The upside of operational clarity
              </h3>
            </div>
          </div>
          <ul className="grid gap-3 text-sm leading-6 text-slate-700">
            {pros.map((item) => (
              <li key={item} className="rounded-2xl bg-white/70 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-rose-200 bg-rose-50 text-slate-950 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
              <ShieldAlert className="h-5 w-5" aria-hidden={true} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Without AppointmentIO
              </p>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                The cost of staying manual
              </h3>
            </div>
          </div>
          <ul className="grid gap-3 text-sm leading-6 text-slate-700">
            {cons.map((item) => (
              <li key={item} className="rounded-2xl bg-white/70 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

