import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SessionsTable } from './SessionsTable';
import { SessionDetailDrawer } from './SessionDetailDrawer';
import { ErrorState } from '../common/ErrorState';
import { api } from '../../lib/api';
import { Session, DateRangeValue } from '../../types';

interface SessionsPageProps {
  dateRange: DateRangeValue;
  isLive: boolean;
}

export function SessionsPage({ dateRange, isLive }: SessionsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const [search, setSearch] = useState('');
  const [device, setDevice] = useState('all');
  const [sortBy, setSortBy] = useState('last_seen');

  // Selected session for journey drawer
  const selectedSessionId = searchParams.get('session');

  // CSV export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Reset to page 1 whenever date range changes
  useEffect(() => {
    setPage(1);
  }, [dateRange]);

  const fetchSessions = useCallback(async () => {
    try {
      setError(null);
      let startDate: string | undefined;
      const now = new Date();
      if (dateRange === '24h') startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      else if (dateRange === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      else if (dateRange === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const res = await api.getSessions({
        page,
        limit: 15,
        search: search.trim() || undefined,
        device: device !== 'all' ? device : undefined,
        sortBy,
        sortOrder: 'desc',
        startDate,
      });

      setSessions(res.sessions || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalSessions(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [page, search, device, sortBy, dateRange]);

  useEffect(() => {
    setLoading(true);
    fetchSessions();
  }, [fetchSessions]);

  // Live auto-refresh
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [isLive, fetchSessions]);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      setExportFeedback(null);

      let startDate: string | undefined;
      const now = new Date();
      if (dateRange === '24h') startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      else if (dateRange === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      else if (dateRange === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      await api.downloadSessionsCsv({
        search: search.trim() || undefined,
        device: device !== 'all' ? device : undefined,
        sortBy,
        sortOrder: 'desc',
        startDate,
      });

      setExportFeedback({
        type: 'success',
        message: `Successfully exported ${totalSessions} sessions to CSV!`,
      });
      setTimeout(() => setExportFeedback(null), 4000);
    } catch (err: any) {
      setExportFeedback({
        type: 'error',
        message: err.message || 'Failed to export CSV. Please try again.',
      });
      setTimeout(() => setExportFeedback(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDevice('all');
    setSortBy('last_seen');
    setPage(1);
  };

  const handleSelectSession = (id: string) => {
    setSearchParams((prev) => {
      prev.set('session', id);
      return prev;
    });
  };

  const handleCloseDrawer = () => {
    setSearchParams((prev) => {
      prev.delete('session');
      return prev;
    });
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchSessions} />;
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback for CSV Export */}
      {exportFeedback && (
        <div
          role="alert"
          className={`px-4 py-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all shadow-card animate-in fade-in duration-200 ${
            exportFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <span>{exportFeedback.message}</span>
          <button
            onClick={() => setExportFeedback(null)}
            className="ml-3 text-xs underline font-normal opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <SessionsTable
        sessions={sessions}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalSessions={totalSessions}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        device={device}
        onDeviceChange={(val) => {
          setDevice(val);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={(val) => {
          setSortBy(val);
          setPage(1);
        }}
        dateRange={dateRange}
        onPageChange={(newPage) => setPage(newPage)}
        onSelectSession={handleSelectSession}
        onExportCsv={handleExportCsv}
        isExporting={isExporting}
        onResetFilters={handleResetFilters}
      />

      <SessionDetailDrawer
        sessionId={selectedSessionId}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
