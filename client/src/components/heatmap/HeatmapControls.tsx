import { Flame } from 'lucide-react';
import { PageMetric } from '../../types';

interface HeatmapControlsProps {
  pages: PageMetric[];
  selectedPageUrl: string;
  onSelectPage: (url: string) => void;
  renderMode: 'heat' | 'points' | 'grid';
  onChangeRenderMode: (mode: 'heat' | 'points' | 'grid') => void;
  radius: number;
  onChangeRadius: (r: number) => void;
  opacity: number;
  onChangeOpacity: (o: number) => void;
  device: string;
  onChangeDevice: (d: string) => void;
  showRageOnly: boolean;
  onToggleRageOnly: () => void;
  totalClicks: number;
}

export function HeatmapControls({
  pages,
  selectedPageUrl,
  onSelectPage,
  renderMode,
  onChangeRenderMode,
  radius,
  onChangeRadius,
  opacity,
  onChangeOpacity,
  device,
  onChangeDevice,
  showRageOnly,
  onToggleRageOnly,
  totalClicks,
}: HeatmapControlsProps) {
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-surface-dark-card border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Page Selector Dropdown */}
        <div className="flex-1 max-w-xl">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Select Tracked Page URL
          </label>
          <div className="relative">
            <select
              value={selectedPageUrl}
              onChange={(e) => onSelectPage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
            >
              {pages.map((p) => (
                <option key={p.page_url} value={p.page_url}>
                  {p.page_path || p.page_url} &bull; ({p.total_clicks} clicks, {p.total_views} views)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clicks badge & View Mode Toggles */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Clicks count badge */}
          <div className="px-3.5 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center gap-2">
            <Flame className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-brand-900 dark:text-brand-200">
              {totalClicks} Clicks
            </span>
          </div>

          {/* Mode Segmented Controls */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => onChangeRenderMode('heat')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                renderMode === 'heat'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Heatmap Blobs
            </button>
            <button
              onClick={() => onChangeRenderMode('points')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                renderMode === 'points'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Click Dots
            </button>
            <button
              onClick={() => onChangeRenderMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                renderMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Grid Density
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Sliders & Options */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Radius Slider */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Radius:</span>
            <input
              type="range"
              min="10"
              max="50"
              value={radius}
              onChange={(e) => onChangeRadius(parseInt(e.target.value, 10))}
              className="w-24 accent-brand-600 cursor-pointer"
            />
            <span className="font-mono text-slate-700 dark:text-slate-300 w-6">{radius}px</span>
          </div>

          {/* Opacity Slider */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Intensity:</span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              className="w-24 accent-brand-600 cursor-pointer"
            />
            <span className="font-mono text-slate-700 dark:text-slate-300 w-8">
              {Math.round(opacity * 100)}%
            </span>
          </div>

          {/* Device Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Device:</span>
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => onChangeDevice('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  device === 'all' ? 'bg-white dark:bg-slate-700 shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => onChangeDevice('desktop')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  device === 'desktop' ? 'bg-white dark:bg-slate-700 shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => onChangeDevice('mobile')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  device === 'mobile' ? 'bg-white dark:bg-slate-700 shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>
        </div>

        {/* Rage click toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showRageOnly}
            onChange={onToggleRageOnly}
            className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500"
          />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Filter to Rage Clicks Only
          </span>
        </label>
      </div>
    </div>
  );
}
