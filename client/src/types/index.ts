export type EventType = 'page_view' | 'click' | 'custom';

export interface TargetElement {
  tag?: string;
  id?: string;
  class?: string;
  text?: string;
  selector?: string;
}

export interface DeviceInfo {
  type?: 'desktop' | 'mobile' | 'tablet' | string;
  browser?: string;
  os?: string;
}

export interface AnalyticsEvent {
  event_id: string;
  session_id: string;
  event_type: EventType;
  page_url: string;
  page_path: string;
  page_title?: string;
  timestamp: string;
  relative_time_seconds?: number;
  sequence?: number;
  x?: number;
  y?: number;
  page_x?: number;
  page_y?: number;
  scroll_x?: number;
  scroll_y?: number;
  normalized_x?: number;
  normalized_y?: number;
  is_rage_click?: boolean;
  viewport_width?: number;
  viewport_height?: number;
  document_width?: number;
  document_height?: number;
  target?: TargetElement;
  device?: DeviceInfo;
}

export interface Session {
  session_id: string;
  first_seen: string;
  last_seen: string;
  total_events: number;
  page_view_count: number;
  click_count: number;
  distinct_pages_count: number;
  pages_visited: string[];
  entry_page?: string;
  device?: DeviceInfo;
  duration_ms: number;
  has_rage_clicks?: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SessionsResponse {
  success: boolean;
  data: Session[];
  pagination: Pagination;
}

export interface HeatmapPoint {
  x?: number;
  y?: number;
  page_x?: number;
  page_y?: number;
  normalized_x?: number;
  normalized_y?: number;
  viewport_width?: number;
  viewport_height?: number;
  document_width?: number;
  document_height?: number;
  is_rage_click?: boolean;
  target?: TargetElement;
  timestamp: string;
}

export interface HeatmapCluster {
  col: number;
  row: number;
  centerX: number;
  centerY: number;
  count: number;
  hasRageClick: boolean;
}

export interface HeatmapResponse {
  page_url: string;
  total_clicks: number;
  points: HeatmapPoint[];
  clusters: HeatmapCluster[];
}

export interface PageMetric {
  page_url: string;
  page_path: string;
  page_title?: string;
  total_views: number;
  total_clicks: number;
  total_events: number;
  last_active: string;
}

export interface OverviewStats {
  total_sessions: number;
  total_events: number;
  page_views: number;
  clicks: number;
  avg_session_duration_seconds: number;
  avg_events_per_session: number;
  activity_over_time: Array<{
    date: string;
    page_views: number;
    clicks: number;
    total: number;
  }>;
  top_pages: Array<{
    page_path: string;
    page_url: string;
    page_title?: string;
    views: number;
    clicks: number;
  }>;
  recent_sessions: Session[];
}

export type DateRangeValue = '24h' | '7d' | '30d' | 'all';
