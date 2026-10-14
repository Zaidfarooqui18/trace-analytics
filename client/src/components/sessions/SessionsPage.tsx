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
        onPageChange={(newPage) => setPage(newPage)}
        onSelectSession={handleSelectSession}
      />

      <SessionDetailDrawer
        sessionId={selectedSessionId}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
