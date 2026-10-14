import { SessionsQuerySchema } from '../validators/event.validator.js';
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
      pagination: data.pagination,
    });
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
