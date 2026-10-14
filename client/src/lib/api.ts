import {
  OverviewStats,
  SessionsResponse,
  AnalyticsEvent,
  HeatmapResponse,
  PageMetric,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
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
  return json.data !== undefined ? json.data : json;
}

export const api = {
  getOverview: (timeRange = '7d'): Promise<OverviewStats> => {
    return fetchJson<OverviewStats>(`/api/overview?timeRange=${timeRange}`);
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
      : (json.data && Array.isArray(json.data.sessions))
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
  },

  downloadSessionsCsv: async (params: {
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    startDate?: string;
    endDate?: string;
    device?: string;
  }): Promise<void> => {
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
  },

  getSessionEvents: (sessionId: string): Promise<AnalyticsEvent[]> => {
    return fetchJson<AnalyticsEvent[]>(`/api/sessions/${encodeURIComponent(sessionId)}/events`);
  },

  getHeatmap: (params: {
    pageUrl: string;
    startDate?: string;
    endDate?: string;
    device?: string;
  }): Promise<HeatmapResponse> => {
    const sp = new URLSearchParams();
    sp.set('pageUrl', params.pageUrl);
    if (params.startDate) sp.set('startDate', params.startDate);
    if (params.endDate) sp.set('endDate', params.endDate);
    if (params.device && params.device !== 'all') sp.set('device', params.device);

    return fetchJson<HeatmapResponse>(`/api/heatmap?${sp.toString()}`);
  },

  getPages: (): Promise<PageMetric[]> => {
    return fetchJson<PageMetric[]>('/api/pages');
  },

  getHealth: (): Promise<{ status: string; uptime: number; database: { status: string; mode: string } }> => {
    return fetchJson('/api/health');
  },
};
