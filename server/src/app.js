import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/env.js';
import eventsRouter from './routes/events.routes.js';
import sessionsRouter from './routes/sessions.routes.js';
import heatmapRouter from './routes/heatmap.routes.js';
import pagesRouter from './routes/pages.routes.js';
import overviewRouter from './routes/overview.routes.js';
import healthRouter from './routes/health.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Security headers with permissive policy for tracker script embedding
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  // Configurable CORS supporting multiple origins
  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (e.g. mobile apps, curl, beacon)
        if (!origin) return callback(null, true);
        const allowed = config.corsOrigins.some(
          (o) => origin === o || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')
        );
        if (allowed) {
          callback(null, true);
        } else if (config.nodeEnv === 'development') {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not permitted by CORS policy`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Rate Limiting for Event Ingestion
  const ingestLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    message: {
      success: false,
      error: 'Too many tracking requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Body parser with support for sendBeacon text/plain or application/json
  app.use(express.json({ limit: '1mb' }));
  app.use(express.text({ type: 'text/plain', limit: '1mb' }));

  // Middleware to parse JSON text from sendBeacon if Content-Type was text/plain
  app.use((req, res, next) => {
    if (typeof req.body === 'string' && req.body.trim().startsWith('{') || typeof req.body === 'string' && req.body.trim().startsWith('[')) {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {}
    }
    next();
  });

  // Serve tracking script directly from backend for easy embedding
  const trackerPath = path.resolve(__dirname, '../../tracker/tracker.js');
  app.get(['/tracker.js', '/public/tracker.js'], (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(trackerPath);
  });

  // API Routes
  app.use('/api/events', ingestLimiter, eventsRouter);
  app.use('/api/sessions', sessionsRouter);
  app.use('/api/heatmap', heatmapRouter);
  app.use('/api/pages', pagesRouter);
  app.use('/api/overview', overviewRouter);
  app.use('/api/stats/overview', overviewRouter); // Satisfies prompt 2 requirement
  app.use('/api/health', healthRouter);

  // Development-only manual seeder endpoint
  app.post('/api/seed', async (req, res, next) => {
    try {
      const { generateDemoSeedData } = await import('./services/seed.service.js');
      const count = parseInt(req.query.sessions || '20', 10);
      const result = await generateDemoSeedData(count);
      res.json({
        success: true,
        message: `Successfully seeded ${result.eventCount} demo events across ${result.sessionCount} sessions`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  });

  // Root welcome / info
  app.get('/', (req, res) => {
    res.json({
      name: 'Trace Analytics API',
      status: 'online',
      version: '1.0.0',
      docs: {
        events: 'POST /api/events',
        sessions: 'GET /api/sessions',
        sessionEvents: 'GET /api/sessions/:sessionId/events',
        heatmap: 'GET /api/heatmap?pageUrl=...',
        pages: 'GET /api/pages',
        overview: 'GET /api/overview (or GET /api/stats/overview)',
        health: 'GET /api/health',
        trackerScript: 'GET /tracker.js',
      },
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Centralized Error Handler
  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    if (config.nodeEnv !== 'test') {
      console.error(`[Error] ${req.method} ${req.url}:`, message);
    }

    res.status(status).json({
      success: false,
      error: message,
      ...(config.nodeEnv === 'development' ? { stack: err.stack } : {}),
    });
  });

  return app;
}
