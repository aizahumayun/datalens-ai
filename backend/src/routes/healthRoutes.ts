import { Router } from 'express';

export const healthRoutes = Router();

healthRoutes.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
