import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MousePointer, Eye, Activity, Clock, Layers } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { MetricCardSkeleton } from '../common/Skeleton';
import { ErrorState } from '../common/ErrorState';
import { ActivityChart } from './ActivityChart';
import { TopPagesTable } from './TopPagesTable';
import { RecentSessionsList } from './RecentSessionsList';
import { SessionDetailDrawer } from '../sessions/SessionDetailDrawer';
import { api } from '../../lib/api';
import { formatNumber, formatDuration } from '../../lib/utils';
import { OverviewStats, DateRangeValue } from '../../types';

interface OverviewPageProps {
  dateRange: DateRangeValue;
  isLive: boolean;
}

export function OverviewPage({ dateRange, isLive }: OverviewPageProps) {
  const [data, setData] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getOverview(dateRange);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  // Live polling
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [isLive, loadData]);

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading || !data ? (
          Array.from({ length: 6 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              title="Total Sessions"
              value={formatNumber(data.total_sessions)}
              subtitle="Active & completed"
              icon={Users}
              pastelVariant="sky"
            />
            <MetricCard
              title="Total Events"
              value={formatNumber(data.total_events)}
              subtitle="Views & clicks"
              icon={Activity}
              pastelVariant="pink"
            />
            <MetricCard
              title="Page Views"
              value={formatNumber(data.page_views)}
              subtitle="Distinct loads"
              icon={Eye}
              pastelVariant="green"
            />
            <MetricCard
              title="User Clicks"
              value={formatNumber(data.clicks)}
              subtitle="Tracked coordinates"
              icon={MousePointer}
              pastelVariant="purple"
            />
            <MetricCard
              title="Avg Duration"
              value={formatDuration(data.avg_session_duration_seconds * 1000)}
              subtitle="Time per session"
              icon={Clock}
              pastelVariant="yellow"
            />
            <MetricCard
              title="Events / Session"
              value={data.avg_events_per_session.toFixed(1)}
              subtitle="Engagement depth"
              icon={Layers}
              pastelVariant="sky"
            />
          </>
        )}
      </div>

      {/* Main Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Over Time Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-surface-dark-card border border-slate-200/80 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Interactions Volume
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hourly and daily distribution of page views and click events
              </p>
            </div>
            {isLive && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Stream
              </span>
            )}
          </div>

          {loading || !data ? (
            <div className="h-72 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ActivityChart data={data.activity_over_time} />
          )}
        </div>

        {/* Recent Sessions List */}
        <div className="p-6 rounded-3xl bg-white dark:bg-surface-dark-card border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Visitor Journeys
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any session to inspect chronological steps
            </p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[340px]">
            {loading || !data ? (
              <div className="space-y-3 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <RecentSessionsList
                sessions={data.recent_sessions}
                onSelectSession={(id) => setSelectedSessionId(id)}
                onViewAll={() => navigate('/sessions')}
              />
            )}
          </div>
        </div>
      </div>

      {/* Top Pages Table Row */}
      <div className="p-6 rounded-3xl bg-white dark:bg-surface-dark-card border border-slate-200/80 dark:border-slate-800 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Top Visited Webpages
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pages with the highest traffic and click density
            </p>
          </div>
        </div>

        {loading || !data ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <TopPagesTable pages={data.top_pages} />
        )}
      </div>

      {/* Slide-over User Journey Drawer */}
      <SessionDetailDrawer
        sessionId={selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
      />
    </div>
  );
}
