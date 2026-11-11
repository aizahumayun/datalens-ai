import express from 'express';
import { env } from './config/env.js';
import { aiRoutes } from './routes/aiRoutes.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json({ limit: '15mb' }));

app.use('/api', healthRoutes);
app.use('/api', aiRoutes);

app.use(errorHandler);

function startServerOnPort(port: number) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(
        `Port ${port} is already in use. Retrying on ${nextPort}...`
      );
      startServerOnPort(nextPort);
      return;
    }

    throw error;
  });
}

startServerOnPort(env.port);