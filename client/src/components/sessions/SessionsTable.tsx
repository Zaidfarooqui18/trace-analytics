import { useState } from 'react';
import {
  Search,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  MousePointer,
  ArrowUpDown,
} from 'lucide-react';
import { Session } from '../../types';
import { DeviceBadge, Badge } from '../common/Badge';
import { TableRowSkeleton } from '../common/Skeleton';
import { formatDuration, formatRelativeTime } from '../../lib/utils';

interface SessionsTableProps {
  sessions: Session[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalSessions: number;
  search: string;
  onSearchChange: (val: string) => void;
  device: string;
  onDeviceChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  dateRange?: string;
  onPageChange: (newPage: number) => void;
  onSelectSession: (sessionId: string) => void;
  onExportCsv: () => void;
  isExporting?: boolean;
  onResetFilters?: () => void;
}

export function SessionsTable({
  sessions,
  loading,
  page,
  totalPages,
  totalSessions,
  search,
  onSearchChange,
  device,
  onDeviceChange,
  sortBy,
  onSortByChange,
  dateRange,
  onPageChange,
  onSelectSession,
  onExportCsv,
  isExporting = false,
  onResetFilters,
}: SessionsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-surface-dark-card border border-slate-200/80 dark:border-slate-800 shadow-card">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Session UUID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Device Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={device}
              onChange={(e) => onDeviceChange(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="last_seen">Recently Active</option>
              <option value="first_seen">First Seen</option>
              <option value="total_events">Most Events</option>
              <option value="duration">Longest Duration</option>
            </select>
          </div>

          {/* Export to CSV (All matching rows from backend) */}
          <button
            onClick={onExportCsv}
            disabled={isExporting || totalSessions === 0}
            title={
              totalSessions === 0
                ? 'No sessions available to export'
                : `Export all ${totalSessions} filtered sessions as CSV`
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {isExporting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-brand-500 rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Export CSV{totalSessions > 0 ? ` (${totalSessions})` : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="rounded-3xl bg-white dark:bg-surface-dark-card border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/40">
                <th className="py-3.5 px-4">Session Identifier</th>
                <th className="py-3.5 px-4">Device / OS</th>
                <th className="py-3.5 px-4">Entry Point</th>
                <th className="py-3.5 px-4 text-center">Events</th>
                <th className="py-3.5 px-4 text-center">Views &bull; Clicks</th>
                <th className="py-3.5 px-4 text-right">Duration</th>
                <th className="py-3.5 px-4 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    {search || device !== 'all' || (dateRange && dateRange !== 'all') ? (
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto p-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 shadow-xs">
                          <Filter className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                          No sessions match your active filters
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                          No sessions were found for the current search query, device type, or date range. Try widening your criteria.
                        </p>
                        {onResetFilters && (
                          <button
                            onClick={onResetFilters}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
                          >
                            Reset Search & Filters
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto p-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-3 shadow-xs">
                          <Download className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                          No analytics sessions recorded yet
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                          Events captured by the tracker will automatically appear here as unified sessions. Open the demo store to generate activity.
                        </p>
                        <a
                          href="http://localhost:3001"
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Open Demo Store</span>
                          <span>&rarr;</span>
                        </a>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                sessions.map((s) => {
                  const isCopied = copiedId === s.session_id;
                  return (
                    <tr
                      key={s.session_id}
                      onClick={() => onSelectSession(s.session_id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {s.session_id.slice(0, 12)}...
                          </span>
                          <button
                            onClick={(e) => handleCopy(s.session_id, e)}
                            title="Copy full UUID"
                            className="p-1 rounded text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {s.has_rage_clicks && (
                            <Badge variant="rage" className="px-1.5 py-0 text-[10px]">
                              Rage
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <DeviceBadge type={s.device?.type} />
                          <span className="text-[11px] text-slate-400">
                            &bull; {s.device?.browser || 'Other'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
                        {s.entry_page || '/'}
                      </td>

                      <td className="py-3.5 px-4 text-center tabular-nums">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {s.total_events}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center tabular-nums text-slate-500">
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 mr-2">
                          <Eye className="w-3 h-3" />
                          <span>{s.page_view_count}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <MousePointer className="w-3 h-3" />
                          <span>{s.click_count}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-700 dark:text-slate-300 font-semibold">
                        {formatDuration(s.duration_ms)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatRelativeTime(s.last_seen)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800 dark:text-slate-200">{sessions.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{totalSessions}</strong> sessions
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
