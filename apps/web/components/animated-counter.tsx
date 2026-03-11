'use client';

import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

type AnimatedCounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
};

export function AnimatedCounter({
  value,
  prefix,
  suffix,
  duration = 1.4,
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.35 });

  return (
    <span ref={ref} className={className}>
      {inView ? (
        <CountUp
          start={0}
          end={value}
          duration={duration}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          preserveValue={false}
        />
      ) : (
        `${prefix ?? ''}0${suffix ?? ''}`
      )}
    </span>
  );
}
