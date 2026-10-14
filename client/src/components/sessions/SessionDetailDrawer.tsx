import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { JourneyTimeline } from './JourneyTimeline';
import { DeviceBadge, Badge } from '../common/Badge';
import { api } from '../../lib/api';
import { formatDuration, formatTimestamp } from '../../lib/utils';
import { AnalyticsEvent } from '../../types';

interface SessionDetailDrawerProps {
  sessionId: string | null;
  onClose: () => void;
}

export function SessionDetailDrawer({ sessionId, onClose }: SessionDetailDrawerProps) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Session Replay-Lite Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);

  // Fetch session events when sessionId changes
  const loadEvents = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      setIsPlaying(false);
      setPlaybackIndex(null);
      const data = await api.getSessionEvents(sessionId);
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch session events');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      loadEvents();
    }
  }, [sessionId, loadEvents]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sessionId) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionId, onClose]);

  // Session Replay-Lite Animation Loop
  useEffect(() => {
    if (!isPlaying || events.length === 0) return;

    const timer = setInterval(() => {
      setPlaybackIndex((prev) => {
        const next = (prev === null ? 0 : prev + 1);
        if (next >= events.length) {
          setIsPlaying(false);
          return events.length - 1;
        }
        return next;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [isPlaying, events.length]);

  if (!sessionId) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];
  const durationMs =
    firstEvent && lastEvent
      ? new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()
      : 0;
  const distinctPages = Array.from(new Set(events.map((e) => e.page_path || '/')));
  const rageClicksCount = events.filter((e) => e.is_rage_click).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-surface-dark-card border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visitor Session
              </span>
              {rageClicksCount > 0 && (
                <Badge variant="rage" className="px-2 py-0.5 text-xs font-semibold">
                  {rageClicksCount} Rage Clicks
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate max-w-sm">
                {sessionId}
              </h2>
              <button
                onClick={handleCopyId}
                title="Copy Session ID"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Summary Grid */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Duration</span>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDuration(durationMs)}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Events</span>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{events.length}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Pages Visited</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {distinctPages.length}
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Device</span>
            <div className="mt-0.5">
              <DeviceBadge type={firstEvent?.device?.type} />
            </div>
          </div>
        </div>

        {/* Replay-Lite Controls Bar */}
        <div className="px-6 py-3 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-surface-dark-card">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (playbackIndex === null) setPlaybackIndex(0);
                setIsPlaying(!isPlaying);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors shadow-xs ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-brand-600 hover:bg-brand-500'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Replay' : 'Play Journey'}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setPlaybackIndex(0);
              }}
              title="Reset Replay"
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              disabled={playbackIndex === null || playbackIndex <= 0}
              onClick={() => setPlaybackIndex((prev) => Math.max(0, (prev || 0) - 1))}
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              disabled={playbackIndex === null || playbackIndex >= events.length - 1}
              onClick={() => setPlaybackIndex((prev) => Math.min(events.length - 1, (prev || 0) + 1))}
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Step {playbackIndex !== null ? playbackIndex + 1 : '-'}/{events.length}
          </div>
        </div>

        {/* Scrollable Event Timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-sm text-rose-500">{error}</div>
          ) : (
            <JourneyTimeline
              events={events}
              activeIndex={playbackIndex}
              onEventClick={(idx) => {
                setIsPlaying(false);
                setPlaybackIndex(idx);
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex justify-between items-center text-xs text-slate-500">
          <span>Started: {firstEvent ? formatTimestamp(firstEvent.timestamp) : '-'}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
