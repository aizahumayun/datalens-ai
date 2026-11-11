import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[Server] Unhandled request error:', err);
  res.status(500).json({ error: 'Unexpected server error. Please try again.' });
};
