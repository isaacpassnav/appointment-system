'use client';

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '@/components/animated-counter';
import { Card, CardContent } from '@/components/ui/card';

export function KpiCard({
  label,
  value,
  suffix,
  trend,
  trendLabel,
}: {
  label: string;
  value: number;
  suffix?: string;
  trend: number;
  trendLabel: string;
}) {
  const trendPositive = trend >= 0;

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
      <Card className="tenant-kpi-card">
        <CardContent className="tenant-kpi-content">
          <p className="tenant-kpi-label">{label}</p>
          <p className="tenant-kpi-value">
            <AnimatedCounter value={value} suffix={suffix} duration={1.6} />
          </p>
          <p
            className={`tenant-kpi-trend ${trendPositive ? 'positive' : 'negative'}`}
            aria-label={trendLabel}
          >
            {trendPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{trendPositive ? '+' : ''}{trend}%</span>
            <span className="tenant-kpi-trend-label">{trendLabel}</span>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
