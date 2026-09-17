// Entry point — starts the HTTP server.
// Responsibilities: load env, seed defaults, create app, listen.
import dotenv from 'dotenv';
dotenv.config();

import { JsonRepository } from './infrastructure/persistence/Repository.js';
import { seedDefaults } from './seed.js';
import { createApp } from './app.js';

// Seed default data on first boot
const repo = new JsonRepository();
seedDefaults(repo);

// Create and start the application
const app = createApp();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());
  console.log(`Orisma backend (Clean/DDD/SOLID) live on http://localhost:${PORT}`);
  console.log(`CORS: ${CORS_ORIGIN.join(', ')}`);
});
