import React from 'react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  pastelVariant?: 'sky' | 'green' | 'pink' | 'purple' | 'yellow';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  pastelVariant = 'sky',
  trend,
  className,
}: MetricCardProps) {
  const pastelStyles = {
    sky: 'bg-[#87CEEB]/20 text-[#0284c7] dark:bg-[#87CEEB]/10 dark:text-[#38bdf8]',
    green: 'bg-[#90EE90]/25 text-[#16a34a] dark:bg-[#90EE90]/10 dark:text-[#4ade80]',
    pink: 'bg-[#FFB6C1]/25 text-[#db2777] dark:bg-[#FFB6C1]/10 dark:text-[#f472b6]',
    purple: 'bg-[#DDA0DD]/25 text-[#9333ea] dark:bg-[#DDA0DD]/10 dark:text-[#c084fc]',
    yellow: 'bg-[#F0E68C]/30 text-[#b45309] dark:bg-[#F0E68C]/10 dark:text-[#fbbf24]',
  };

  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-white dark:bg-surface-dark-card border border-slate-200/85 dark:border-slate-800 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={cn('p-2.5 rounded-xl transition-transform hover:scale-105', pastelStyles[pastelVariant])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'text-xs font-semibold px-1.5 py-0.5 rounded-md',
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}
