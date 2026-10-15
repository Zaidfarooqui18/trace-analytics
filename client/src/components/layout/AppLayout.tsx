import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sparkles, Server } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '../common/CommandPalette';
import { EmbedModal } from '../common/EmbedModal';
import { BackendModal } from '../common/BackendModal';
import { DateRangeValue } from '../../types';
import { getIsDemoMode, setDemoMode } from '../../lib/api';

interface AppLayoutProps {
  dateRange: DateRangeValue;
  onDateRangeChange: (val: DateRangeValue) => void;
  isLive: boolean;
  onToggleLive: () => void;
}

export function AppLayout({
  dateRange,
  onDateRangeChange,
  isLive,
  onToggleLive,
}: AppLayoutProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(getIsDemoMode());
  const location = useLocation();

  useEffect(() => {
    const handleModeChange = () => {
      setIsDemoMode(getIsDemoMode());
    };
    window.addEventListener('cf_mode_change', handleModeChange);
    return () => window.removeEventListener('cf_mode_change', handleModeChange);
  }, []);

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Overview',
          subtitle: 'High-level engagement and visitor interaction metrics',
        };
      case '/sessions':
        return {
          title: 'Sessions Explorer',
          subtitle: 'Inspect individual visitor sessions and chronological user journeys',
        };
      case '/heatmaps':
        return {
          title: 'Click Heatmaps',
          subtitle: 'Coordinate-accurate visual distribution of user clicks across pages',
        };
      default:
        return {
          title: 'Trace Analytics',
          subtitle: 'Understand every user journey',
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-200">
      <Sidebar onOpenEmbedModal={() => setIsEmbedOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          isLive={isLive}
          onToggleLive={onToggleLive}
          onOpenCommandPalette={() => setIsCommandOpen(true)}
        />

        {/* Prominent Demonstration Mode disclaimer banner */}
        {isDemoMode && (
          <aside
            aria-label="Demonstration mode notice"
            className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 px-6 py-2.5 text-xs text-amber-900 dark:text-amber-200 transition-colors"
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 uppercase tracking-wider shrink-0">
                  <Sparkles className="w-3 h-3 mr-1 inline" />
                  Demo Mode
                </span>
                <span className="truncate sm:overflow-visible sm:whitespace-normal">
                  <strong>Standalone Demonstration Mode:</strong> Displaying representative sample dataset (24 sessions, visitor timelines, coordinate heatmaps) for evaluation on GitHub Pages static hosting.
                </span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsBackendModalOpen(true)}
                  className="inline-flex items-center gap-1 font-semibold underline hover:text-amber-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Server className="w-3 h-3" />
                  <span>Backend Setup Info</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoMode(false);
                    window.location.reload();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 font-semibold transition-colors cursor-pointer"
                  title="Attempt live backend API connection"
                >
                  Try Live API
                </button>
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          <Outlet />
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenEmbedModal={() => setIsEmbedOpen(true)}
      />

      <EmbedModal isOpen={isEmbedOpen} onClose={() => setIsEmbedOpen(false)} />

      <BackendModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </div>
  );
}

