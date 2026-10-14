import * as analyticsService from '../services/analytics.service.js';

export async function listPages(req, res, next) {
  try {
    const pages = await analyticsService.getDistinctPages();

    return res.status(200).json({
      success: true,
      data: pages,
      total: pages.length,
    });
  } catch (error) {
    next(error);
  }
}
