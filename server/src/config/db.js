import mongoose from 'mongoose';
import { config } from './env.js';

let memoryServer = null;

export async function connectDb() {
  const uri = config.mongodbUri;

  if (uri) {
    try {
      console.log('[Database] Connecting to configured MongoDB instance...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[Database] Connected successfully to MongoDB.');
      return mongoose.connection;
    } catch (err) {
      console.warn(`[Database] Failed to connect to configured URI (${err.message}).`);
      if (config.nodeEnv === 'production') {
        throw err;
      }
      console.log('[Database] Falling back to automatic in-memory MongoDB for seamless development...');
    }
  }

  // Fallback to in-memory MongoDB for seamless zero-config local evaluation
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log('[Database] Connected to automatic In-Memory MongoDB (Zero-configuration mode).');
    return mongoose.connection;
  } catch (memErr) {
    console.error('[Database] In-memory database initialization failed:', memErr.message);
    throw memErr;
  }
}

export async function disconnectDb() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    console.log('[Database] Disconnected cleanly.');
  } catch (err) {
    console.error('[Database] Error disconnecting:', err.message);
  }
}

export function getDbStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const stateCode = mongoose.connection.readyState;
  return {
    status: states[stateCode] || 'unknown',
    isInMemory: !!memoryServer,
    databaseName: mongoose.connection.name || 'trace_analytics',
  };
}
