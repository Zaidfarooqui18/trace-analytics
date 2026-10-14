import { getDbStatus } from '../config/db.js';

export function getHealth(req, res) {
  const dbStatus = getDbStatus();
  const isHealthy = dbStatus.status === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.status,
      mode: dbStatus.isInMemory ? 'in-memory (dev)' : 'persistent',
    },
    version: '1.0.0',
  });
}
