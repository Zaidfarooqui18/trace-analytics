import { useState, useEffect } from 'react';
import { Search, Radio, Database } from 'lucide-react';
import { DateRangePicker } from '../common/DateRangePicker';
import { DateRangeValue } from '../../types';
import { api } from '../../lib/api';

interface HeaderProps {
  title: string;
  subtitle?: string;
  dateRange: DateRangeValue;
  onDateRangeChange: (val: DateRangeValue) => void;
  isLive: boolean;
  onToggleLive: () => void;
  onOpenCommandPalette: () => void;
}

export function Header({
  title,
  subtitle,
  dateRange,
  onDateRangeChange,
  isLive,
  onToggleLive,
  onOpenCommandPalette,
}: HeaderProps) {
  const [dbStatus, setDbStatus] = useState<{ status: string; mode: string } | null>(null);

  useEffect(() => {
    api.getHealth()
      .then((res) => {
        setDbStatus(res.database);
      })
      .catch(() => {
        setDbStatus({ status: 'offline', mode: 'unknown' });
      });
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Database connectivity badge */}
        {dbStatus && (
          <div
            title={`MongoDB status: ${dbStatus.status} (${dbStatus.mode})`}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
          >
            <Database className="w-3 h-3 text-emerald-500" />
            <span className="capitalize">{dbStatus.status === 'connected' ? 'DB Connected' : 'DB Offline'}</span>
          </div>
        )}

        {/* Real-time Tracker Ingestion Status */}
        <div
          title="Tracking ingestion pipeline is active and accepting events"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Tracker Active</span>
        </div>

        {/* Live Auto-Refresh Polling Toggle */}
        <button
          onClick={onToggleLive}
          title={isLive ? 'Auto-refresh active (polling every 5s)' : 'Auto-refresh paused. Click to enable 5s live polling.'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            isLive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
          <span>{isLive ? 'Live Sync: On' : 'Live Sync: Off'}</span>
        </button>

        {/* Date Range Selector */}
        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
