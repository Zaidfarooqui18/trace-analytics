import {
  OverviewStats,
  SessionsResponse,
  AnalyticsEvent,
  HeatmapResponse,
  PageMetric,
} from '../types';
import { mockDataService } from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Determine initial mode:
// If the user has explicitly selected a mode, use that.
// Otherwise, on GitHub Pages static hosting without a configured backend URL,
// default to standalone demonstration mode so evaluators can inspect data immediately.
let isDemoMode = (() => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('cf_demo_mode');
  if (stored !== null) {
    return stored === 'true';
  }
  return !API_BASE && window.location.hostname.endsWith('github.io');
})();

export function getIsDemoMode(): boolean {
  return isDemoMode;
}


export function setDemoMode(val: boolean) {
  isDemoMode = val;
  if (typeof window !== 'undefined') {
    localStorage.setItem('cf_demo_mode', String(val));
    window.dispatchEvent(new Event('cf_mode_change'));
  }
}

function getMissingBackendMessage(): string | null {
  if (!API_BASE && typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return 'Backend API is not deployed on GitHub Pages. To connect live analytics, deploy the backend and configure VITE_API_BASE_URL.';
  }
  return null;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  } catch (networkErr: any) {
    const hint = getMissingBackendMessage();
    if (hint) throw new Error(hint);
    throw networkErr;
  }

  if (!res.ok) {
    const hint = getMissingBackendMessage();
    if (hint && res.status === 404) {
      throw new Error(hint);
    }

    let errMsg = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errMsg = errJson.error;
    } catch (e) {}
    throw new Error(errMsg);
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const api = {
  getOverview: async (timeRange = '7d'): Promise<OverviewStats> => {
    if (isDemoMode) {
      return mockDataService.getOverview(timeRange);
    }
    try {
      return await fetchJson<OverviewStats>(`/api/overview?timeRange=${timeRange}`);
    } catch (err) {
      if (!API_BASE && typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
        setDemoMode(true);
        return mockDataService.getOverview(timeRange);
      }
      throw err;
    }
  },

  getSessions: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    startDate?: string;
    endDate?: string;
    device?: string;
  }): Promise<{ sessions: SessionsResponse['data']; pagination: SessionsResponse['pagination'] }> => {
    if (isDemoMode) {
      return mockDataService.getSessions(params);
    }
    try {
      const sp = new URLSearchParams();
      if (params.page) sp.set('page', params.page.toString());
      if (params.limit) sp.set('limit', params.limit.toString());
      if (params.search) sp.set('search', params.search);
      if (params.sortBy) sp.set('sortBy', params.sortBy);
      if (params.sortOrder) sp.set('sortOrder', params.sortOrder);
      if (params.startDate) sp.set('startDate', params.startDate);
      if (params.endDate) sp.set('endDate', params.endDate);
      if (params.device && params.device !== 'all') sp.set('device', params.device);

      const res = await fetch(`${API_BASE}/api/sessions?${sp.toString()}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        let errMsg = `Request failed: ${res.status} ${res.statusText}`;
        try {
          const errJson = await res.json();
          if (errJson.error) errMsg = errJson.error;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const json = await res.json();
      const sessionsList = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.sessions)
        ? json.sessions
        : Array.isArray(json)
        ? json
        : json.data && Array.isArray(json.data.sessions)
        ? json.data.sessions
        : [];

      const paginationData = json.pagination ||
        (json.data && json.data.pagination) || {
          total: sessionsList.length,
          page: params.page || 1,
          limit: params.limit || 15,
          totalPages: Math.ceil(sessionsList.length / (params.limit || 15)) || 1,
        };

      return {
        sessions: sessionsList,
        pagination: paginationData,
      };
    } catch (err) {
      if (!API_BASE && typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
        setDemoMode(true);
        return mockDataService.getSessions(params);
      }
      throw err;
    }
  },

  downloadSessionsCsv: async (params: {
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    startDate?: string;
    endDate?: string;
    device?: string;
  }): Promise<void> => {
    if (isDemoMode) {
      mockDataService.downloadSessionsCsv(params);
      return;
    }
    try {
      const sp = new URLSearchParams();
      if (params.search) sp.set('search', params.search);
      if (params.sortBy) sp.set('sortBy', params.sortBy);
      if (params.sortOrder) sp.set('sortOrder', params.sortOrder);
      if (params.startDate) sp.set('startDate', params.startDate);
      if (params.endDate) sp.set('endDate', params.endDate);
      if (params.device && params.device !== 'all') sp.set('device', params.device);

      const res = await fetch(`${API_BASE}/api/sessions/export?${sp.toString()}`);
      if (!res.ok) {
        let errMsg = `Export request failed: ${res.status} ${res.statusText}`;
        try {
          const errJson = await res.json();
          if (errJson.error) errMsg = errJson.error;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const blob = await res.blob();
      const filenameDate = new Date().toISOString().split('T')[0];
      const filename = `trace-analytics-sessions-${filenameDate}.csv`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      mockDataService.downloadSessionsCsv(params);
    }
  },

  getSessionEvents: async (sessionId: string): Promise<AnalyticsEvent[]> => {
    if (isDemoMode) {
      return mockDataService.getSessionEvents(sessionId);
    }
    try {
      return await fetchJson<AnalyticsEvent[]>(`/api/sessions/${encodeURIComponent(sessionId)}/events`);
    } catch (err) {
      if (!API_BASE && typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
        setDemoMode(true);
        return mockDataService.getSessionEvents(sessionId);
      }
      throw err;
    }
  },

  getHeatmap: async (params: {
    pageUrl: string;
    startDate?: string;
    endDate?: string;
    device?: string;
  }): Promise<HeatmapResponse> => {
    if (isDemoMode) {
      return mockDataService.getHeatmap(params);
    }
    try {
      const sp = new URLSearchParams();
      sp.set('pageUrl', params.pageUrl);
      if (params.startDate) sp.set('startDate', params.startDate);
      if (params.endDate) sp.set('endDate', params.endDate);
      if (params.device && params.device !== 'all') sp.set('device', params.device);

      return await fetchJson<HeatmapResponse>(`/api/heatmap?${sp.toString()}`);
    } catch (err) {
      if (!API_BASE && typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
        setDemoMode(true);
        return mockDataService.getHeatmap(params);
      }
      throw err;
    }
  },

  getPages: async (): Promise<PageMetric[]> => {
    if (isDemoMode) {
      return mockDataService.getPages();
    }
    try {
      return await fetchJson<PageMetric[]>('/api/pages');
    } catch (err) {
      if (!API_BASE && typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
        setDemoMode(true);
        return mockDataService.getPages();
      }
      throw err;
    }
  },

  getHealth: async (): Promise<{ status: string; uptime: number; database: { status: string; mode: string } }> => {
    if (isDemoMode) {
      return {
        status: 'demo',
        uptime: 3600,
        database: { status: 'demo', mode: 'Standalone Demonstration Mode' },
      };
    }
    try {
      return await fetchJson('/api/health');
    } catch (err) {
      if (!API_BASE && typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
        return {
          status: 'demo',
          uptime: 3600,
          database: { status: 'demo', mode: 'Standalone Demonstration Mode' },
        };
      }
      throw err;
    }
  },
};
