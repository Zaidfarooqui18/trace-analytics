import React from 'react';
import { cn } from '../../lib/utils';
import { MousePointer, Eye, Zap, Flame, Monitor, Smartphone, Tablet } from 'lucide-react';
import { EventType } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'page_view' | 'click' | 'rage' | 'success' | 'outline' | 'neutral';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const styles = {
    default: 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border-brand-200 dark:border-brand-800',
    page_view: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    click: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    rage: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900 animate-pulse',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    outline: 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function EventBadge({ type, isRage = false }: { type: EventType; isRage?: boolean }) {
  if (isRage) {
    return (
      <Badge variant="rage">
        <Flame className="w-3 h-3 text-rose-500" />
        <span>Rage Click</span>
      </Badge>
    );
  }

  if (type === 'page_view') {
    return (
      <Badge variant="page_view">
        <Eye className="w-3 h-3 text-blue-500" />
        <span>Page View</span>
      </Badge>
    );
  }

  if (type === 'click') {
    return (
      <Badge variant="click">
        <MousePointer className="w-3 h-3 text-amber-500" />
        <span>Click</span>
      </Badge>
    );
  }

  return (
    <Badge variant="neutral">
      <Zap className="w-3 h-3 text-slate-500" />
      <span>{type}</span>
    </Badge>
  );
}

export function DeviceBadge({ type }: { type?: string }) {
  const t = (type || 'desktop').toLowerCase();
  let Icon = Monitor;
  if (t === 'mobile') Icon = Smartphone;
  if (t === 'tablet') Icon = Tablet;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 capitalize">
      <Icon className="w-3.5 h-3.5" />
      <span>{t}</span>
    </span>
  );
}
