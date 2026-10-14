import { EventIngestSchema } from '../validators/event.validator.js';
import * as eventService from '../services/event.service.js';

export async function ingest(req, res, next) {
  try {
    const parseResult = EventIngestSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const result = await eventService.ingestEvents(parseResult.data);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
