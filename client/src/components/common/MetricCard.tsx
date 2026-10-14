import React from 'react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
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
  trend,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-white dark:bg-surface-dark-card border border-slate-200/80 dark:border-slate-800 shadow-card hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-brand-600 dark:text-brand-400">
          <Icon className="w-5 h-5" />
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
