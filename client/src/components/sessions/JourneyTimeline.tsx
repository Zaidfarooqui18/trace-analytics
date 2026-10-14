import { Eye, MousePointer, Flame, Zap, Target } from 'lucide-react';
import { AnalyticsEvent } from '../../types';
import { formatTimestamp } from '../../lib/utils';
import { EventBadge } from '../common/Badge';

interface JourneyTimelineProps {
  events: AnalyticsEvent[];
  activeIndex?: number | null;
  onEventClick?: (index: number) => void;
}

export function JourneyTimeline({
  events,
  activeIndex = null,
  onEventClick,
}: JourneyTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No events recorded for this session.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {events.map((evt, idx) => {
        const isClick = evt.event_type === 'click';
        const isRage = !!evt.is_rage_click;
        const isActive = activeIndex === idx;

        let Icon = Zap;
        if (isRage) Icon = Flame;
        else if (isClick) Icon = MousePointer;
        else if (evt.event_type === 'page_view') Icon = Eye;

        const iconBg = isRage
          ? 'bg-rose-500 text-white shadow-rose-500/30 shadow-md ring-4 ring-rose-100 dark:ring-rose-950'
          : isClick
          ? 'bg-amber-500 text-white shadow-amber-500/20 ring-4 ring-amber-50 dark:ring-amber-950/60'
          : 'bg-blue-600 text-white shadow-blue-500/20 ring-4 ring-blue-50 dark:ring-blue-950/60';

        return (
          <div
            key={evt.event_id || idx}
            onClick={() => onEventClick?.(idx)}
            className={`relative flex items-start gap-4 p-3.5 rounded-2xl transition-all cursor-pointer ${
              isActive
                ? 'bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 shadow-sm scale-[1.01]'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            {/* Timeline node icon */}
            <div
              className={`absolute -left-[30px] top-4 w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-transform ${iconBg} ${
                isActive ? 'scale-125' : ''
              }`}
            >
              <Icon className="w-2.5 h-2.5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <EventBadge type={evt.event_type} isRage={isRage} />
                  <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {evt.page_path || '/'}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                    +{evt.relative_time_seconds ?? 0}s
                  </span>
                </div>
              </div>

              {evt.page_title && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2">
                  {evt.page_title}
                </p>
              )}

              {/* Click Coordinates & Target Info */}
              {isClick && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>
                      Coords: <strong className="text-slate-900 dark:text-slate-200">({evt.x ?? evt.page_x ?? 0}, {evt.y ?? evt.page_y ?? 0})</strong>
                    </span>
                    <span>
                      Normalized: <strong className="text-slate-900 dark:text-slate-200">({evt.normalized_x ?? 0}, {evt.normalized_y ?? 0})</strong>
                    </span>
                  </div>

                  {evt.target && (evt.target.tag || evt.target.text) && (
                    <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 flex items-start gap-1.5 text-[11px]">
                      <Target className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="truncate text-slate-600 dark:text-slate-300">
                        {evt.target.tag && (
                          <span className="text-brand-600 dark:text-brand-400 font-semibold mr-1">
                            &lt;{evt.target.tag}&gt;
                          </span>
                        )}
                        {evt.target.text && <span>"{evt.target.text}"</span>}
                        {evt.target.selector && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {evt.target.selector}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                {formatTimestamp(evt.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
