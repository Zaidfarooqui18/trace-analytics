import { createApp } from '../server/src/app.js';
import { connectDb } from '../server/src/config/db.js';

let appInstance = null;

async function getApp() {
  if (!appInstance) {
    await connectDb();
    appInstance = createApp();
  }
  return appInstance;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}
