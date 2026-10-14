import { Event } from '../models/Event.js';
import { normalizeCanonicalUrl } from '../utils/url.js';

export async function getSessions({
  page = 1,
  limit = 20,
  search,
  sortBy = 'last_seen',
  sortOrder = 'desc',
  startDate,
  endDate,
  device,
}) {
  const matchStage = {};

  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = new Date(startDate);
    if (endDate) matchStage.timestamp.$lte = new Date(endDate);
  }

  if (device && device !== 'all') {
    matchStage['device.type'] = device;
  }

  if (search) {
    matchStage.session_id = { $regex: search, $options: 'i' };
  }

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortMap = {
    last_seen: { last_seen: sortDirection },
    first_seen: { first_seen: sortDirection },
    total_events: { total_events: sortDirection },
    duration: { duration_ms: sortDirection },
  };
  const sortCriterion = sortMap[sortBy] || { last_seen: -1 };

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$session_id',
        session_id: { $first: '$session_id' },
        first_seen: { $min: '$timestamp' },
        last_seen: { $max: '$timestamp' },
        total_events: { $sum: 1 },
        page_view_count: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] },
        },
        click_count: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] },
        },
        pages_visited: { $addToSet: '$page_path' },
        device: { $last: '$device' },
        entry_page: { $first: '$page_path' },
        has_rage_clicks: { $max: '$is_rage_click' },
      },
    },
    {
      $project: {
        _id: 0,
        session_id: 1,
        first_seen: 1,
        last_seen: 1,
        total_events: 1,
        page_view_count: 1,
        click_count: 1,
        distinct_pages_count: { $size: '$pages_visited' },
        pages_visited: 1,
        device: 1,
        entry_page: 1,
        has_rage_clicks: { $ifNull: ['$has_rage_clicks', false] },
        duration_ms: { $subtract: ['$last_seen', '$first_seen'] },
      },
    },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: sortCriterion },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
      },
    },
  ];

  const results = await Event.aggregate(pipeline);
  const total = results[0]?.metadata[0]?.total || 0;
  const sessions = results[0]?.data || [];

  return {
    sessions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getSessionEvents(sessionId) {
  if (!sessionId) {
    return [];
  }

  const events = await Event.find({ session_id: sessionId })
    .sort({ timestamp: 1 })
    .lean();

  if (events.length === 0) {
    return [];
  }

  const startTime = new Date(events[0].timestamp).getTime();

  return events.map((evt, index) => {
    const evtTime = new Date(evt.timestamp).getTime();
    const relativeSeconds = Math.max(0, Math.round((evtTime - startTime) / 1000));

    return {
      event_id: evt.event_id,
      session_id: evt.session_id,
      event_type: evt.event_type,
      page_url: evt.page_url,
      page_path: evt.page_path,
      page_title: evt.page_title,
      timestamp: evt.timestamp,
      relative_time_seconds: relativeSeconds,
      sequence: index + 1,
      x: evt.x,
      y: evt.y,
      page_x: evt.page_x,
      page_y: evt.page_y,
      normalized_x: evt.normalized_x,
      normalized_y: evt.normalized_y,
      is_rage_click: evt.is_rage_click || false,
      target: evt.target || {},
      device: evt.device || {},
    };
  });
}

export async function getHeatmapData({ pageUrl, url, startDate, endDate, device, cluster }) {
  const targetUrl = normalizeCanonicalUrl(pageUrl || url || '');
  if (!targetUrl) {
    return { points: [], total_clicks: 0, clusters: [] };
  }

  let pathOnly = targetUrl;
  try {
    if (targetUrl.includes('://')) {
      pathOnly = new URL(targetUrl).pathname;
    }
  } catch (e) {}

  const match = {
    $or: [
      { page_url: targetUrl },
      { page_path: targetUrl },
      { page_path: pathOnly },
      { page_url: { $regex: `${pathOnly}$`, $options: 'i' } },
    ],
    event_type: 'click',
  };

  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = new Date(startDate);
    if (endDate) match.timestamp.$lte = new Date(endDate);
  }

  if (device && device !== 'all') {
    match['device.type'] = device;
  }

  const clicks = await Event.find(match)
    .select('x y page_x page_y normalized_x normalized_y viewport_width viewport_height document_width document_height is_rage_click target timestamp')
    .sort({ timestamp: -1 })
    .limit(1000)
    .lean();

  // Grid density clustering (20x20 grid on normalized 0..1 scale)
  const gridClusters = {};
  clicks.forEach((c) => {
    const nx = typeof c.normalized_x === 'number' ? c.normalized_x : 0;
    const ny = typeof c.normalized_y === 'number' ? c.normalized_y : 0;
    const col = Math.min(Math.floor(nx * 20), 19);
    const row = Math.min(Math.floor(ny * 20), 19);
    const key = `${col}_${row}`;
    if (!gridClusters[key]) {
      gridClusters[key] = {
        col,
        row,
        centerX: (col + 0.5) / 20,
        centerY: (row + 0.5) / 20,
        count: 0,
        hasRageClick: false,
      };
    }
    gridClusters[key].count += 1;
    if (c.is_rage_click) gridClusters[key].hasRageClick = true;
  });

  return {
    page_url: targetUrl,
    total_clicks: clicks.length,
    points: clicks,
    clusters: Object.values(gridClusters),
  };
}

export async function getDistinctPages() {
  const pages = await Event.aggregate([
    {
      $group: {
        _id: '$page_url',
        page_url: { $first: '$page_url' },
        page_path: { $first: '$page_path' },
        page_title: { $last: '$page_title' },
        total_views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] },
        },
        total_clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] },
        },
        total_events: { $sum: 1 },
        last_active: { $max: '$timestamp' },
      },
    },
    { $sort: { total_views: -1, total_clicks: -1 } },
  ]);

  return pages.map((p) => ({
    page_url: p.page_url,
    page_path: p.page_path,
    page_title: p.page_title,
    total_views: p.total_views,
    total_clicks: p.total_clicks,
    total_events: p.total_events,
    last_active: p.last_active,
  }));
}

export async function getOverviewStats({ timeRange = '7d', startDate, endDate }) {
  const match = {};
  const now = new Date();

  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = new Date(startDate);
    if (endDate) match.timestamp.$lte = new Date(endDate);
  } else if (timeRange === '24h') {
    match.timestamp = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
  } else if (timeRange === '7d') {
    match.timestamp = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
  } else if (timeRange === '30d') {
    match.timestamp = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
  }

  // 1. Core totals aggregation
  const [metrics] = await Event.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total_events: { $sum: 1 },
        page_views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] },
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] },
        },
        sessions: { $addToSet: '$session_id' },
      },
    },
  ]).then((res) => res.length > 0 ? res : [{ total_events: 0, page_views: 0, clicks: 0, sessions: [] }]);

  const totalSessions = metrics.sessions?.length || 0;
  const totalEvents = metrics.total_events || 0;
  const pageViews = metrics.page_views || 0;
  const clicks = metrics.clicks || 0;

  // 2. Average session duration
  const sessionDurations = await Event.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$session_id',
        start: { $min: '$timestamp' },
        end: { $max: '$timestamp' },
      },
    },
    {
      $project: {
        duration_seconds: {
          $divide: [{ $subtract: ['$end', '$start'] }, 1000],
        },
      },
    },
    {
      $group: {
        _id: null,
        avg_duration_seconds: { $avg: '$duration_seconds' },
      },
    },
  ]);

  const avgSessionDurationSeconds = Math.round(
    sessionDurations[0]?.avg_duration_seconds || 0
  );
  const avgEventsPerSession = totalSessions > 0
    ? parseFloat((totalEvents / totalSessions).toFixed(1))
    : 0;

  // 3. Activity over time (grouped by day or hour)
  const is24h = timeRange === '24h';
  const dateFormat = is24h ? '%Y-%m-%d %H:00' : '%Y-%m-%d';

  const timeSeries = await Event.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$timestamp' } },
        page_views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] },
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] },
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const activityOverTime = timeSeries.map((item) => ({
    date: item._id,
    page_views: item.page_views,
    clicks: item.clicks,
    total: item.total,
  }));

  // 4. Top pages
  const topPages = await Event.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$page_path',
        page_path: { $first: '$page_path' },
        page_url: { $first: '$page_url' },
        page_title: { $last: '$page_title' },
        views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] },
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] },
        },
      },
    },
    { $sort: { views: -1, clicks: -1 } },
    { $limit: 5 },
  ]);

  // 5. Recent 5 sessions
  const recentSessionsResult = await getSessions({
    page: 1,
    limit: 5,
    sortBy: 'last_seen',
    sortOrder: 'desc',
    startDate,
    endDate,
  });

  return {
    total_sessions: totalSessions,
    total_events: totalEvents,
    page_views: pageViews,
    clicks: clicks,
    avg_session_duration_seconds: avgSessionDurationSeconds,
    avg_events_per_session: avgEventsPerSession,
    activity_over_time: activityOverTime,
    top_pages: topPages,
    recent_sessions: recentSessionsResult.sessions,
  };
}
