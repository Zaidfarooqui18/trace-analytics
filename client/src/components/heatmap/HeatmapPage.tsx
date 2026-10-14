import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HeatmapControls } from './HeatmapControls';
import { HeatmapCanvas } from './HeatmapCanvas';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import { api } from '../../lib/api';
import { PageMetric, HeatmapResponse, DateRangeValue } from '../../types';

interface HeatmapPageProps {
  dateRange: DateRangeValue;
  isLive: boolean;
}

export function HeatmapPage({ dateRange, isLive }: HeatmapPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pages, setPages] = useState<PageMetric[]>([]);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string>('');
  const [heatmapData, setHeatmapData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Heatmap configuration
  const [renderMode, setRenderMode] = useState<'heat' | 'points' | 'grid'>('heat');
  const [radius, setRadius] = useState<number>(24);
  const [opacity, setOpacity] = useState<number>(0.75);
  const [device, setDevice] = useState<string>('all');
  const [showRageOnly, setShowRageOnly] = useState<boolean>(false);

  // 1. Fetch available tracked pages
  useEffect(() => {
    api.getPages()
      .then((data) => {
        setPages(data);
        const urlParam = searchParams.get('url');
        if (urlParam) {
          setSelectedPageUrl(urlParam);
        } else if (data.length > 0) {
          setSelectedPageUrl(data[0].page_url);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch tracked pages');
      });
  }, [searchParams]);

  // 2. Fetch heatmap clicks when selected page or filters change
  const fetchHeatmap = useCallback(async () => {
    if (!selectedPageUrl) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let startDate: string | undefined;
      const now = new Date();
      if (dateRange === '24h') startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      else if (dateRange === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      else if (dateRange === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const data = await api.getHeatmap({
        pageUrl: selectedPageUrl,
        startDate,
        device: device !== 'all' ? device : undefined,
      });

      setHeatmapData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch heatmap data');
    } finally {
      setLoading(false);
    }
  }, [selectedPageUrl, dateRange, device]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  // Live auto-refresh
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(fetchHeatmap, 5000);
    return () => clearInterval(interval);
  }, [isLive, fetchHeatmap]);

  const handleSelectPage = (url: string) => {
    setSelectedPageUrl(url);
    setSearchParams((prev) => {
      prev.set('url', url);
      return prev;
    });
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchHeatmap} />;
  }

  if (pages.length === 0 && !loading) {
    return (
      <EmptyState
        title="No tracked pages found"
        description="Interact with the demo store or embed tracker.js to start capturing clicks and generating heatmaps."
        action={{
          label: 'Open Demo Store',
          onClick: () => window.open('http://localhost:3001', '_blank'),
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <HeatmapControls
        pages={pages}
        selectedPageUrl={selectedPageUrl}
        onSelectPage={handleSelectPage}
        renderMode={renderMode}
        onChangeRenderMode={setRenderMode}
        radius={radius}
        onChangeRadius={setRadius}
        opacity={opacity}
        onChangeOpacity={setOpacity}
        device={device}
        onChangeDevice={setDevice}
        showRageOnly={showRageOnly}
        onToggleRageOnly={() => setShowRageOnly(!showRageOnly)}
        totalClicks={heatmapData?.total_clicks || 0}
      />

      {loading ? (
        <div className="w-full aspect-[16/10] min-h-[500px] rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Aggregating coordinates...</span>
          </div>
        </div>
      ) : heatmapData && heatmapData.points.length === 0 ? (
        <EmptyState
          title="No clicks recorded for this page"
          description="Click around on this webpage in the demo store to generate click points and heatmap heat blobs."
          action={{
            label: 'Open Demo Store',
            onClick: () => window.open(selectedPageUrl || 'http://localhost:3001', '_blank'),
          }}
        />
      ) : (
        <HeatmapCanvas
          points={heatmapData?.points || []}
          clusters={heatmapData?.clusters || []}
          renderMode={renderMode}
          radius={radius}
          opacity={opacity}
          showRageOnly={showRageOnly}
          pageUrl={selectedPageUrl}
        />
      )}
    </div>
  );
}
