import { useNavigate } from 'react-router-dom';
import { Eye, MousePointer, Flame } from 'lucide-react';
import { formatNumber } from '../../lib/utils';

interface TopPagesTableProps {
  pages: Array<{
    page_path: string;
    page_url: string;
    page_title?: string;
    views: number;
    clicks: number;
  }>;
}

export function TopPagesTable({ pages }: TopPagesTableProps) {
  const navigate = useNavigate();

  if (!pages || pages.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No tracked pages recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
            <th className="pb-3 px-3">Page Path</th>
            <th className="pb-3 px-3 text-right">Views</th>
            <th className="pb-3 px-3 text-right">Clicks</th>
            <th className="pb-3 px-3 text-right">CTR</th>
            <th className="pb-3 px-3 text-right">Heatmap</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
          {pages.map((p, idx) => {
            const ctr = p.views > 0 ? ((p.clicks / p.views) * 100).toFixed(1) : '0.0';
            return (
              <tr
                key={idx}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-3 px-3">
                  <div className="font-mono text-slate-900 dark:text-slate-100 text-xs">
                    {p.page_path || '/'}
                  </div>
                  {p.page_title && (
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">
                      {p.page_title}
                    </div>
                  )}
                </td>
                <td className="py-3 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                  <div className="inline-flex items-center gap-1 justify-end">
                    <Eye className="w-3 h-3 text-blue-500" />
                    <span>{formatNumber(p.views)}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                  <div className="inline-flex items-center gap-1 justify-end">
                    <MousePointer className="w-3 h-3 text-amber-500" />
                    <span>{formatNumber(p.clicks)}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                  {ctr}%
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() =>
                      navigate(`/heatmaps?url=${encodeURIComponent(p.page_url || p.page_path)}`)
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
                  >
                    <Flame className="w-3 h-3" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
