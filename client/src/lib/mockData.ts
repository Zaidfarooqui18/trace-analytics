import {
  OverviewStats,
  Session,
  SessionsResponse,
  AnalyticsEvent,
  HeatmapResponse,
  HeatmapPoint,
  HeatmapCluster,
  PageMetric,
} from '../types';

const PAGES = [
  { url: 'demo/index.html', path: '/index.html', title: 'Trace Commerce — Minimalist Essentials' },
  { url: 'demo/products.html', path: '/products.html', title: 'Catalog & Collections — Trace Commerce' },
  { url: 'demo/product.html', path: '/product.html', title: 'Aura Studio Wireless Headphones — Trace Commerce' },
  { url: 'demo/checkout.html', path: '/checkout.html', title: 'Secure Checkout — Trace Commerce' },
];

const DEVICES = [
  { type: 'desktop', browser: 'Chrome', os: 'macOS' },
  { type: 'desktop', browser: 'Safari', os: 'macOS' },
  { type: 'desktop', browser: 'Firefox', os: 'Windows' },
  { type: 'desktop', browser: 'Chrome', os: 'Windows' },
  { type: 'mobile', browser: 'Safari', os: 'iOS' },
  { type: 'mobile', browser: 'Chrome', os: 'Android' },
  { type: 'tablet', browser: 'Safari', os: 'iOS' },
];

const TARGETS = [
  { tag: 'button', id: 'add-to-cart-btn', class: 'btn-primary', text: 'Add to Bag — $299', selector: 'button#add-to-cart-btn' },
  { tag: 'a', id: 'hero-cta-btn', class: 'btn-primary', text: 'Explore Aura Studio ($299)', selector: 'a#hero-cta-btn' },
  { tag: 'button', id: 'filter-audio', class: 'chip active', text: 'Wireless Audio', selector: 'button#filter-audio' },
  { tag: 'button', id: 'place-order-btn', class: 'btn-primary', text: 'Place Order • $324.50', selector: 'button#place-order-btn' },
  { tag: 'button', id: 'swatch-black', class: 'swatch', text: 'Matte Black', selector: 'button#swatch-black' },
  { tag: 'a', id: 'nav-products', class: 'nav-link', text: 'Products', selector: 'a#nav-products' },
  { tag: 'button', id: 'qty-plus', class: 'qty-btn', text: '+', selector: 'button#qty-plus' },
  { tag: 'div', id: 'card-aura-headphone', class: 'card', text: 'Aura Studio Wireless', selector: 'div#card-aura-headphone' },
];

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface DemoDataStore {
  sessions: Session[];
  eventsBySession: Record<string, AnalyticsEvent[]>;
  allEvents: AnalyticsEvent[];
}

function buildDemoStore(): DemoDataStore {
  const sessions: Session[] = [];
  const eventsBySession: Record<string, AnalyticsEvent[]> = {};
  const allEvents: AnalyticsEvent[] = [];
  const now = Date.now();

  for (let s = 0; s < 24; s++) {
    const sessionId = generateUUID();
    const device = DEVICES[s % DEVICES.length];
    const daysAgo = (s % 7) * 0.8 + Math.random() * 0.5;
    const sessionStartTime = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - (s % 8) * 60 * 60 * 1000);
    let currentTime = new Date(sessionStartTime.getTime());

    const isMobile = device.type === 'mobile';
    const vw = isMobile ? 390 : 1440;
    const vh = isMobile ? 844 : 900;
    const dw = vw;
    const dh = isMobile ? 2200 : 1600;

    const pageCount = (s % 3) + 2;
    const visitedPages = PAGES.slice(0, pageCount);
    const hasRageClick = s % 4 === 1;

    const sessionEvents: AnalyticsEvent[] = [];
    let clickCount = 0;
    let pageViewCount = 0;

    for (let p = 0; p < visitedPages.length; p++) {
      const page = visitedPages[p];
      pageViewCount++;

      const pvEvent: AnalyticsEvent = {
        event_id: generateUUID(),
        session_id: sessionId,
        event_type: 'page_view',
        page_url: page.url,
        page_path: page.path,
        page_title: page.title,
        timestamp: currentTime.toISOString(),
        relative_time_seconds: Math.round((currentTime.getTime() - sessionStartTime.getTime()) / 1000),
        sequence: sessionEvents.length + 1,
        viewport_width: vw,
        viewport_height: vh,
        document_width: dw,
        document_height: dh,
        device,
      };
      sessionEvents.push(pvEvent);
      allEvents.push(pvEvent);

      const clicksOnPage = (s % 4) + 2;
      for (let c = 0; c < clicksOnPage; c++) {
        currentTime = new Date(currentTime.getTime() + (Math.random() * 12 + 3) * 1000);
        clickCount++;

        const normX = parseFloat((0.15 + (Math.random() * 0.7)).toFixed(4));
        const normY = parseFloat((0.10 + (Math.random() * 0.75)).toFixed(4));
        const pageX = Math.round(normX * dw);
        const pageY = Math.round(normY * dh);
        const clientX = Math.min(pageX, vw);
        const clientY = Math.min(pageY % vh, vh);

        const isThisRage = hasRageClick && p === visitedPages.length - 1 && c === clicksOnPage - 1;
        const target = TARGETS[(s + p + c) % TARGETS.length];

        const clickEvent: AnalyticsEvent = {
          event_id: generateUUID(),
          session_id: sessionId,
          event_type: 'click',
          page_url: page.url,
          page_path: page.path,
          page_title: page.title,
          timestamp: currentTime.toISOString(),
          relative_time_seconds: Math.round((currentTime.getTime() - sessionStartTime.getTime()) / 1000),
          sequence: sessionEvents.length + 1,
          x: clientX,
          y: clientY,
          page_x: pageX,
          page_y: pageY,
          scroll_x: 0,
          scroll_y: Math.max(0, pageY - clientY),
          normalized_x: normX,
          normalized_y: normY,
          is_rage_click: isThisRage,
          viewport_width: vw,
          viewport_height: vh,
          document_width: dw,
          document_height: dh,
          target,
          device,
        };
        sessionEvents.push(clickEvent);
        allEvents.push(clickEvent);

        if (isThisRage) {
          for (let r = 1; r <= 2; r++) {
            clickCount++;
            const rageEvent: AnalyticsEvent = {
              event_id: generateUUID(),
              session_id: sessionId,
              event_type: 'click',
              page_url: page.url,
              page_path: page.path,
              page_title: page.title,
              timestamp: new Date(currentTime.getTime() + r * 160).toISOString(),
              relative_time_seconds: Math.round((currentTime.getTime() - sessionStartTime.getTime()) / 1000),
              sequence: sessionEvents.length + 1,
              x: clientX + (Math.random() * 6 - 3),
              y: clientY + (Math.random() * 6 - 3),
              page_x: pageX,
              page_y: pageY,
              scroll_x: 0,
              scroll_y: Math.max(0, pageY - clientY),
              normalized_x: normX,
              normalized_y: normY,
              is_rage_click: true,
              viewport_width: vw,
              viewport_height: vh,
              document_width: dw,
              document_height: dh,
              target,
              device,
            };
            sessionEvents.push(rageEvent);
            allEvents.push(rageEvent);
          }
        }
      }

      currentTime = new Date(currentTime.getTime() + 5000);
    }

    const durationMs = currentTime.getTime() - sessionStartTime.getTime();

    const sessionObj: Session = {
      session_id: sessionId,
      first_seen: sessionStartTime.toISOString(),
      last_seen: currentTime.toISOString(),
      total_events: sessionEvents.length,
      page_view_count: pageViewCount,
      click_count: clickCount,
      distinct_pages_count: visitedPages.length,
      pages_visited: visitedPages.map((p) => p.path),
      entry_page: visitedPages[0].path,
      device,
      duration_ms: durationMs,
      has_rage_clicks: hasRageClick,
    };

    sessions.push(sessionObj);
    eventsBySession[sessionId] = sessionEvents;
  }

  // Sort sessions newest first
  sessions.sort((a, b) => new Date(b.first_seen).getTime() - new Date(a.first_seen).getTime());

  return { sessions, eventsBySession, allEvents };
}

// Global cached demo store
let demoStoreInstance: DemoDataStore | null = null;
function getDemoStore(): DemoDataStore {
  if (!demoStoreInstance) {
    demoStoreInstance = buildDemoStore();
  }
  return demoStoreInstance;
}

export const mockDataService = {
  getOverview: (timeRange = '7d'): OverviewStats => {
    const store = getDemoStore();
    const sessions = store.sessions;
    const allEvents = store.allEvents;

    const totalSessions = sessions.length;
    const totalEvents = allEvents.length;
    const pageViews = allEvents.filter((e) => e.event_type === 'page_view').length;
    const clicks = allEvents.filter((e) => e.event_type === 'click').length;
    const totalDuration = sessions.reduce((acc, s) => acc + s.duration_ms, 0);
    const avgDuration = Math.round(totalDuration / totalSessions / 1000);
    const avgEventsPerSession = parseFloat((totalEvents / totalSessions).toFixed(1));

    // Daily breakdown for activity chart
    const days = timeRange === '24h' ? 1 : timeRange === '30d' ? 30 : 7;
    const activity_over_time: Array<{ date: string; page_views: number; clicks: number; total: number }> = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const pv = Math.floor(pageViews / days + (Math.random() * 8 - 4));
      const cl = Math.floor(clicks / days + (Math.random() * 14 - 7));
      activity_over_time.push({
        date: dateStr,
        page_views: Math.max(1, pv),
        clicks: Math.max(1, cl),
        total: Math.max(2, pv + cl),
      });
    }

    const top_pages = PAGES.map((p) => {
      const pv = allEvents.filter((e) => e.page_path === p.path && e.event_type === 'page_view').length;
      const cl = allEvents.filter((e) => e.page_path === p.path && e.event_type === 'click').length;
      return {
        page_path: p.path,
        page_url: p.url,
        page_title: p.title,
        views: pv || 12,
        clicks: cl || 28,
      };
    });

    return {
      total_sessions: totalSessions,
      total_events: totalEvents,
      page_views: pageViews,
      clicks,
      avg_session_duration_seconds: avgDuration,
      avg_events_per_session: avgEventsPerSession,
      activity_over_time,
      top_pages,
      recent_sessions: sessions.slice(0, 5),
    };
  },

  getSessions: (params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    device?: string;
  }): { sessions: Session[]; pagination: SessionsResponse['pagination'] } => {
    const store = getDemoStore();
    let filtered = [...store.sessions];

    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (sess) =>
          sess.session_id.toLowerCase().includes(s) ||
          (sess.entry_page && sess.entry_page.toLowerCase().includes(s)) ||
          (sess.device?.os && sess.device.os.toLowerCase().includes(s))
      );
    }

    if (params.device && params.device !== 'all') {
      filtered = filtered.filter((sess) => sess.device?.type === params.device);
    }

    const sortBy = params.sortBy || 'first_seen';
    const isAsc = params.sortOrder === 'asc';

    filtered.sort((a: any, b: any) => {
      let av = a[sortBy];
      let bv = b[sortBy];
      if (typeof av === 'string' && Date.parse(av)) {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }
      return isAsc ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });

    const page = params.page || 1;
    const limit = params.limit || 15;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIdx = (page - 1) * limit;
    const sliced = filtered.slice(startIdx, startIdx + limit);

    return {
      sessions: sliced,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  downloadSessionsCsv: (params: {
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    device?: string;
  }) => {
    const store = getDemoStore();
    let filtered = [...store.sessions];

    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter((sess) => sess.session_id.toLowerCase().includes(s));
    }
    if (params.device && params.device !== 'all') {
      filtered = filtered.filter((sess) => sess.device?.type === params.device);
    }

    const headers = [
      'Session ID',
      'First Seen',
      'Last Seen',
      'Duration (sec)',
      'Total Events',
      'Page Views',
      'Clicks',
      'Entry Page',
      'Device Type',
      'Browser',
      'OS',
      'Has Rage Clicks',
    ];

    const rows = filtered.map((s) => [
      `"${s.session_id}"`,
      `"${s.first_seen}"`,
      `"${s.last_seen}"`,
      Math.round(s.duration_ms / 1000),
      s.total_events,
      s.page_view_count,
      s.click_count,
      `"${s.entry_page || ''}"`,
      `"${s.device?.type || ''}"`,
      `"${s.device?.browser || ''}"`,
      `"${s.device?.os || ''}"`,
      s.has_rage_clicks ? 'Yes' : 'No',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trace-analytics-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  getSessionEvents: (sessionId: string): AnalyticsEvent[] => {
    const store = getDemoStore();
    return store.eventsBySession[sessionId] || [];
  },

  getPages: (): PageMetric[] => {
    const store = getDemoStore();
    return PAGES.map((p) => {
      const pv = store.allEvents.filter((e) => e.page_path === p.path && e.event_type === 'page_view').length;
      const cl = store.allEvents.filter((e) => e.page_path === p.path && e.event_type === 'click').length;
      return {
        page_url: p.url,
        page_path: p.path,
        page_title: p.title,
        total_views: pv || 15,
        total_clicks: cl || 35,
        total_events: (pv || 15) + (cl || 35),
        last_active: new Date().toISOString(),
      };
    });
  },

  getHeatmap: (params: { pageUrl: string; device?: string; showRageOnly?: boolean }): HeatmapResponse => {
    const store = getDemoStore();
    const targetPath = params.pageUrl.includes('.html')
      ? '/' + params.pageUrl.split('/').pop()
      : '/index.html';

    let clicks = store.allEvents.filter((e) => e.event_type === 'click' && e.page_path === targetPath);

    if (params.device && params.device !== 'all') {
      clicks = clicks.filter((c) => c.device?.type === params.device);
    }
    if (params.showRageOnly) {
      clicks = clicks.filter((c) => c.is_rage_click);
    }

    const points: HeatmapPoint[] = clicks.map((c) => ({
      x: c.x,
      y: c.y,
      page_x: c.page_x,
      page_y: c.page_y,
      normalized_x: c.normalized_x,
      normalized_y: c.normalized_y,
      viewport_width: c.viewport_width,
      viewport_height: c.viewport_height,
      document_width: c.document_width,
      document_height: c.document_height,
      is_rage_click: c.is_rage_click,
      target: c.target,
      timestamp: c.timestamp,
    }));

    // Generate clusters for grid density
    const clusters: HeatmapCluster[] = [];
    const gridSize = 10;
    const map: Record<string, { count: number; hasRage: boolean; sumX: number; sumY: number }> = {};

    points.forEach((p) => {
      const col = Math.floor((p.normalized_x || 0) * gridSize);
      const row = Math.floor((p.normalized_y || 0) * gridSize);
      const key = `${col}_${row}`;
      if (!map[key]) {
        map[key] = { count: 0, hasRage: false, sumX: 0, sumY: 0 };
      }
      map[key].count++;
      if (p.is_rage_click) map[key].hasRage = true;
      map[key].sumX += p.normalized_x || 0;
      map[key].sumY += p.normalized_y || 0;
    });

    Object.entries(map).forEach(([key, val]) => {
      const [col, row] = key.split('_').map(Number);
      clusters.push({
        col,
        row,
        centerX: val.sumX / val.count,
        centerY: val.sumY / val.count,
        count: val.count,
        hasRageClick: val.hasRage,
      });
    });

    return {
      page_url: params.pageUrl,
      total_clicks: points.length,
      points,
      clusters,
    };
  },
};
