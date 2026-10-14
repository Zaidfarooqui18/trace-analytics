import { HeatmapQuerySchema } from '../validators/event.validator.js';
import * as analyticsService from '../services/analytics.service.js';

export async function getHeatmap(req, res, next) {
  try {
    const parseResult = HeatmapQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: parseResult.error.errors,
      });
    }

    const { pageUrl, url } = parseResult.data;
    const target = pageUrl || url;

    if (!target) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameter: pageUrl (or url)',
      });
    }

    const data = await analyticsService.getHeatmapData(parseResult.data);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
