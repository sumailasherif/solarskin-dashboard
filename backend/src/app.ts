// Builds the Express app (routes + middleware) WITHOUT starting it.
// Keeping "build" separate from "listen" (server.ts) lets tests call the app
// directly with supertest, without opening a real network port.
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { API_PREFIX, APP_NAME } from '@solarskin/shared';
import { env } from './config/env';

export function createApp() {
  const app = express();

  // --- Middleware: code that runs on every request, in this order ---
  app.use(helmet()); // sets safe HTTP headers
  app.use(cors({ origin: env.CORS_ORIGIN })); // only our dashboard may call us from a browser
  app.use(express.json({ limit: '100kb' })); // parse JSON bodies, reject huge ones

  // --- Routes ---
  // Health check: hosting platforms and the dashboard call this to see if the API is up.
  app.get(`${API_PREFIX}/health`, (_req, res) => {
    res.json({ status: 'ok', app: APP_NAME, time: new Date().toISOString() });
  });

  // Anything we don't recognise gets a JSON 404 (not an HTML error page).
  app.use((_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  return app;
}
