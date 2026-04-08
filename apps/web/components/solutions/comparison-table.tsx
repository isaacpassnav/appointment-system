import { Check, Minus, X } from 'lucide-react';
import type { ComparisonFeature } from '@/components/solutions/solutions-data';

function StatusIcon({
  value,
}: {
  value: 'check' | 'partial' | 'cross';
}) {
  if (value === 'check') {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Check className="h-4 w-4" aria-hidden={true} />
      </span>
    );
  }

  if (value === 'partial') {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Minus className="h-4 w-4" aria-hidden={true} />
      </span>
    );
  }

  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
      <X className="h-4 w-4" aria-hidden={true} />
    </span>
  );
}

export function ComparisonTable({
  features,
}: {
  features: ComparisonFeature[];
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-slate-100">
            <tr className="text-sm text-slate-600">
              <th className="px-6 py-4 font-semibold">Feature</th>
              <th className="px-4 py-4 font-semibold text-slate-950">AppointmentIO</th>
              <th className="px-4 py-4 font-semibold">Calendly</th>
              <th className="px-4 py-4 font-semibold">Acuity</th>
              <th className="px-4 py-4 font-semibold">SimplyBook</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr
                key={feature.label}
                className="border-t border-slate-200 text-sm text-slate-700"
              >
                <td className="px-6 py-4 font-medium text-slate-950">
                  {feature.label}
                </td>
                <td className="px-4 py-4">
                  <StatusIcon value={feature.appointmentIo} />
                </td>
                <td className="px-4 py-4">
                  <StatusIcon value={feature.calendly} />
                </td>
                <td className="px-4 py-4">
                  <StatusIcon value={feature.acuity} />
                </td>
                <td className="px-4 py-4">
                  <StatusIcon value={feature.simplyBook} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

