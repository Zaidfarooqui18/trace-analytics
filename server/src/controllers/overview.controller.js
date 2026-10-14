import { OverviewQuerySchema } from '../validators/event.validator.js';
import * as analyticsService from '../services/analytics.service.js';

export async function getOverview(req, res, next) {
  try {
    const parseResult = OverviewQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: parseResult.error.errors,
      });
    }

    const data = await analyticsService.getOverviewStats(parseResult.data);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
