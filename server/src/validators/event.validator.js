import { z } from 'zod';
import { normalizeCanonicalUrl } from '../utils/url.js';

const SingleEventSchema = z
  .object({
    event_id: z.string().min(1).default(() => crypto.randomUUID()),
    session_id: z.string().min(1, 'session_id is required'),
    event_type: z.enum(['page_view', 'click', 'custom']),
    page_url: z.string().min(1, 'page_url is required').transform(normalizeCanonicalUrl),
    page_path: z.string().optional().default('/'),
    page_title: z.string().optional().default(''),
    timestamp: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), {
        message: 'Invalid ISO 8601 timestamp',
      }),
    x: z.number().optional(),
    y: z.number().optional(),
    page_x: z.number().optional(),
    page_y: z.number().optional(),
    scroll_x: z.number().optional().default(0),
    scroll_y: z.number().optional().default(0),
    normalized_x: z.number().min(0).max(1).optional(),
    normalized_y: z.number().min(0).max(1).optional(),
    is_rage_click: z.boolean().optional().default(false),
    viewport_width: z.number().nonnegative().optional(),
    viewport_height: z.number().nonnegative().optional(),
    document_width: z.number().nonnegative().optional(),
    document_height: z.number().nonnegative().optional(),
    target: z
      .object({
        tag: z.string().optional().default(''),
        id: z.string().optional().default(''),
        class: z.string().optional().default(''),
        text: z.string().optional().default(''),
        selector: z.string().optional().default(''),
      })
      .optional()
      .default({}),
    device: z
      .object({
        type: z.string().optional().default('desktop'),
        browser: z.string().optional().default('Other'),
        os: z.string().optional().default('Other'),
      })
      .optional()
      .default({}),
    referrer: z.string().optional().default(''),
    user_agent: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.event_type === 'click') {
      const hasCoords =
        data.x !== undefined ||
        data.page_x !== undefined ||
        data.normalized_x !== undefined;
      if (!hasCoords) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Click events require valid coordinates (x, page_x, or normalized_x)',
          path: ['x'],
        });
      }
    }
  });

export const EventIngestSchema = z.union([
  SingleEventSchema,
  z.array(SingleEventSchema).min(1, 'Event batch cannot be empty'),
]);

export const SessionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z.enum(['last_seen', 'first_seen', 'total_events', 'duration']).default('last_seen'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  device: z.enum(['desktop', 'mobile', 'tablet', 'all']).optional(),
});

export const HeatmapQuerySchema = z.object({
  pageUrl: z.string().optional(),
  url: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  device: z.enum(['desktop', 'mobile', 'tablet', 'all']).optional(),
  cluster: z.coerce.boolean().optional().default(false),
});

export const OverviewQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeRange: z.enum(['24h', '7d', '30d', 'all']).optional().default('7d'),
});
