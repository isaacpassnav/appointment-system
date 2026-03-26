import { Card, CardContent } from '@/components/ui/card';

type NoShowLoss = {
  label: string;
  volume: string;
  noShowRate: string;
  monthlyLoss: string;
  projectedRecovery: string;
};

export function NoShowCalculator({ items }: { items: NoShowLoss[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.label}
          className="rounded-[24px] border-slate-200 bg-white text-slate-950 shadow-sm"
        >
          <CardContent className="space-y-5 p-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {item.label}
              </p>
              <h3 className="font-display text-3xl font-semibold tracking-tight text-rose-600">
                {item.monthlyLoss}
              </h3>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p>{item.volume}</p>
              <p>{item.noShowRate}</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-700">
                {item.projectedRecovery}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

