import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './components/overview/OverviewPage';
import { SessionsPage } from './components/sessions/SessionsPage';
import { HeatmapPage } from './components/heatmap/HeatmapPage';
import { DateRangeValue } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

export function App() {
  const [dateRange, setDateRange] = useState<DateRangeValue>('7d');
  const [isLive, setIsLive] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <AppLayout
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                isLive={isLive}
                onToggleLive={() => setIsLive(!isLive)}
              />
            }
          >
            <Route index element={<OverviewPage dateRange={dateRange} isLive={isLive} />} />
            <Route path="sessions" element={<SessionsPage dateRange={dateRange} isLive={isLive} />} />
            <Route path="heatmaps" element={<HeatmapPage dateRange={dateRange} isLive={isLive} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
