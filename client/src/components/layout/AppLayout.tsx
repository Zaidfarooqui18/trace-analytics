import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '../common/CommandPalette';
import { EmbedModal } from '../common/EmbedModal';
import { DateRangeValue } from '../../types';

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
  const location = useLocation();

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
    </div>
  );
}
