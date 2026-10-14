import { Session } from '../../types';
import { DeviceBadge, Badge } from '../common/Badge';
import { formatDuration, formatRelativeTime } from '../../lib/utils';
import { ChevronRight, ArrowUpRight } from 'lucide-react';

interface RecentSessionsListProps {
  sessions: Session[];
  onSelectSession: (sessionId: string) => void;
  onViewAll: () => void;
}

export function RecentSessionsList({
  sessions,
  onSelectSession,
  onViewAll,
}: RecentSessionsListProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No recent visitor sessions detected.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
      {sessions.map((s) => (
        <div
          key={s.session_id}
          onClick={() => onSelectSession(s.session_id)}
          className="py-3 px-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl cursor-pointer transition-colors group"
        >
          <div className="space-y-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                {s.session_id.slice(0, 8)}...
              </span>
              <DeviceBadge type={s.device?.type} />
              {s.has_rage_clicks && (
                <Badge variant="rage" className="px-1.5 py-0 text-[10px]">
                  Rage
                </Badge>
              )}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span>Entry: {s.entry_page || '/'}</span>
              <span>&bull;</span>
              <span>{formatRelativeTime(s.last_seen)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right shrink-0">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                {s.total_events} events
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {formatDuration(s.duration_ms)}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      ))}

      <div className="pt-3 px-3 text-center">
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          <span>Explore All Sessions</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
