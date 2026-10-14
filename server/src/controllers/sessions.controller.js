import { SessionsQuerySchema, SessionsExportQuerySchema } from '../validators/event.validator.js';
import * as analyticsService from '../services/analytics.service.js';

export async function listSessions(req, res, next) {
  try {
    const parseResult = SessionsQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: parseResult.error.errors,
      });
    }

    const data = await analyticsService.getSessions(parseResult.data);

    return res.status(200).json({
      success: true,
      data: data.sessions,
      sessions: data.sessions,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function exportSessions(req, res, next) {
  try {
    const parseResult = SessionsExportQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters for export',
        details: parseResult.error.errors,
      });
    }

    const sessions = await analyticsService.getAllSessionsForExport(parseResult.data);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `trace-analytics-sessions-${dateStr}.csv`;

    const headers = [
      'session_id',
      'first_seen',
      'last_active',
      'duration_seconds',
      'total_events',
      'page_views',
      'clicks',
      'entry_page',
      'device',
      'operating_system',
    ];

    function escapeCsv(val) {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const rows = sessions.map((s) => [
      escapeCsv(s.session_id),
      escapeCsv(s.first_seen ? new Date(s.first_seen).toISOString() : ''),
      escapeCsv(s.last_seen ? new Date(s.last_seen).toISOString() : ''),
      escapeCsv(Math.round((s.duration_ms || 0) / 1000)),
      escapeCsv(s.total_events || 0),
      escapeCsv(s.page_view_count || 0),
      escapeCsv(s.click_count || 0),
      escapeCsv(s.entry_page || '/'),
      escapeCsv(s.device?.type || 'desktop'),
      escapeCsv(s.device?.os || 'Other'),
    ]);

    // Prepend UTF-8 BOM (\uFEFF) for compatibility with Excel and other spreadsheet applications
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

export async function getSessionEvents(req, res, next) {
  try {
    const { sessionId } = req.params;

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing sessionId parameter',
      });
    }

    const events = await analyticsService.getSessionEvents(sessionId.trim());

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No events found for this session',
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: events,
      total_events: events.length,
    });
  } catch (error) {
    next(error);
  }
}
