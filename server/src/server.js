import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { config } from './config/env.js';

async function bootstrap() {
  try {
    await connectDb();

    // Auto-seed initial realistic demo dataset if database is empty in development
    if (config.nodeEnv !== 'production' && config.nodeEnv !== 'test') {
      const { Event } = await import('./models/Event.js');
      const eventCount = await Event.countDocuments();
      if (eventCount === 0) {
        console.log('[Server] Database is empty on startup. Auto-seeding initial realistic demo dataset...');
        const { generateDemoSeedData } = await import('./services/seed.service.js');
        await generateDemoSeedData(20);
        console.log('[Server] Auto-seed complete.');
      }
    }

    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 Trace Analytics Server running on http://localhost:${config.port}`);
      console.log(`📡 Tracker Script available at: http://localhost:${config.port}/tracker.js`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`======================================================\n`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        const { disconnectDb } = await import('./config/db.js');
        await disconnectDb();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
}

bootstrap();
