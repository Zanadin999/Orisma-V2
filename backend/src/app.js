// Express application factory.
// Wires all dependencies (DI) and mounts routes.
// Kept separate from server.js (which only starts the listener).
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { JsonRepository } from './infrastructure/persistence/Repository.js';
import { AuthService } from './application/services/AuthService.js';
import { InventoryService } from './application/services/InventoryService.js';
import { SalesService } from './application/services/SalesService.js';

import makeAuthRoutes from './presentation/routes/auth.js';
import makeUnitsRoutes from './presentation/routes/units.js';
import makeTxRoutes from './presentation/routes/transactions.js';
import makeAccountsRoutes from './presentation/routes/accounts.js';
import makeSettingsRoutes from './presentation/routes/settings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createApp() {
  // --- Dependency Injection composition root ---
  const repo = new JsonRepository();
  const authService = new AuthService(repo);
  const inventoryService = new InventoryService(repo);
  const salesService = new SalesService(repo);

  // --- Express setup ---
  const app = express();
  const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(s => s.trim());

  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));

  // Health / info
  app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
  app.get('/api', (_req, res) =>
    res.json({
      name: 'Orisma Backend (DDD+SOLID)',
      version: '2.0.0',
      endpoints: ['/api/auth/login', '/api/units', '/api/transactions', '/api/accounts', '/api/settings'],
    })
  );

  // Mount feature routes (each factory receives its injected service)
  app.use('/api/auth', makeAuthRoutes(authService));
  app.use('/api/units', makeUnitsRoutes(inventoryService));
  app.use('/api/transactions', makeTxRoutes(salesService));
  app.use('/api/accounts', makeAccountsRoutes(authService));
  app.use('/api/settings', makeSettingsRoutes(repo));

  // Serve frontend build if present (single-process deploy)
  const distPath = join(__dirname, '../../dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
      res.sendFile(join(distPath, 'index.html'));
    });
  }

  return app;
}
