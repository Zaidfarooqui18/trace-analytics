import { Calendar } from 'lucide-react';
import { DateRangeValue } from '../../types';
import { cn } from '../../lib/utils';

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const options: { label: string; value: DateRangeValue }[] = [
    { label: '24 Hours', value: '24h' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60',
        className
      )}
    >
      <div className="pl-2 pr-1 text-slate-400 dark:text-slate-500">
        <Calendar className="w-3.5 h-3.5" />
      </div>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
            value === opt.value
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
